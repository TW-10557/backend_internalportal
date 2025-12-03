import type { Server as HTTPServer } from "http"
import WebSocket from "ws"
import jwt from "jsonwebtoken"

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
  isAlive?: boolean
}

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocket.Server({ server })

  // Authenticate WebSocket connection
  wss.on("connection", (ws: AuthenticatedWebSocket, req) => {
    const token = new URL(`http://localhost${req.url}`).searchParams.get("token")

    if (!token) {
      ws.close(4001, "Unauthorized: Token required")
      return
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      ws.userId = decoded.userId
      ws.isAlive = true

      console.log(`[WS] User ${decoded.userId} connected`)

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connection",
          message: "Connected to real-time updates",
          userId: decoded.userId,
        }),
      )

      // Handle messages
      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data)
          handleWebSocketMessage(ws, message, wss)
        } catch (error) {
          console.error("[WS] Message parse error:", error)
        }
      })

      // Handle pong
      ws.on("pong", () => {
        ws.isAlive = true
      })

      // Handle close
      ws.on("close", () => {
        console.log(`[WS] User ${ws.userId} disconnected`)
      })

      // Handle errors
      ws.on("error", (error) => {
        console.error("[WS] Error:", error)
      })
    } catch (error) {
      ws.close(4003, "Invalid token")
    }
  })

  // Ping clients every 30 seconds
  const interval = setInterval(() => {
    wss.clients.forEach((ws: AuthenticatedWebSocket) => {
      if (!ws.isAlive) {
        ws.terminate()
        return
      }
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  // Cleanup on server close
  wss.on("close", () => {
    clearInterval(interval)
  })

  return wss
}

function handleWebSocketMessage(ws: AuthenticatedWebSocket, message: any, wss: WebSocket.Server) {
  const { type, data } = message

  switch (type) {
    case "subscribe":
      console.log(`[WS] User ${ws.userId} subscribed to ${data.channel}`)
      ws.send(JSON.stringify({ type: "subscribed", channel: data.channel }))
      break

    case "ping":
      ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }))
      break

    case "update":
      // Broadcast to all clients
      broadcastUpdate(wss, {
        type: "update",
        resource: data.resource,
        action: data.action,
        data: data.payload,
        timestamp: new Date().toISOString(),
      })
      break

    default:
      console.log(`[WS] Unknown message type: ${type}`)
  }
}

export function broadcastUpdate(wss: WebSocket.Server, message: any) {
  const payload = JSON.stringify(message)
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  })
}
