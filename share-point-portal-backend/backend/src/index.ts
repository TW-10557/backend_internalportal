import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import authRoutes from "./routes/auth"
import newsRoutes from "./routes/news"
import eventsRoutes from "./routes/events"
import documentsRoutes from "./routes/documents"
import teamsRoutes from "./routes/teams"
import announcementsRoutes from "./routes/announcements"
import usersRoutes from "./routes/users"
import { authenticateToken } from "./middleware/auth"
import { initializeDatabase } from "./database/init"
import { setupWebSocket } from "./websocket/server"

dotenv.config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Public routes
app.use("/api/auth", authRoutes)

// Protected routes - require authentication
app.use("/api/news", authenticateToken, newsRoutes)
app.use("/api/events", authenticateToken, eventsRoutes)
app.use("/api/documents", authenticateToken, documentsRoutes)
app.use("/api/teams", authenticateToken, teamsRoutes)
app.use("/api/announcements", authenticateToken, announcementsRoutes)
app.use("/api/users", authenticateToken, usersRoutes)

// WebSocket setup
setupWebSocket(server)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    timestamp: new Date().toISOString(),
  })
})

// Initialize database and start server
const startServer = async () => {
  try {
    console.log("[SERVER] Initializing database...")
    await initializeDatabase()
    console.log("[SERVER] Database initialized successfully")

    server.listen(PORT, () => {
      console.log(`[SERVER] Server running on http://localhost:${PORT}`)
      console.log(`[SERVER] WebSocket available at ws://localhost:${PORT}`)
    })
  } catch (error) {
    console.error("[SERVER] Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

export default app
