"use client"

import { useState, useCallback } from "react"

export function useApi<T>(apiFunction: (...args: any[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiFunction(...args)
        setData(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunction],
  )

  return { data, loading, error, execute }
}

export function useWebSocket(token: string) {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<any[]>([])

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host.replace(/:\d+/, ":5000")}?token=${token}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log("[WS] Connected")
      setConnected(true)
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages((prev) => [...prev, message])
    }

    ws.onerror = (error) => {
      console.error("[WS] Error:", error)
      setConnected(false)
    }

    ws.onclose = () => {
      console.log("[WS] Disconnected")
      setConnected(false)
    }

    return ws
  }, [token])

  return { connected, messages, connect }
}
