import { Router, type Request, type Response } from "express"
import { fetchTeamsData, getTeamsChannels, getTeamsMessages } from "../services/teamsService"

const router = Router()

// Get Teams channels
router.get("/channels", async (req: Request, res: Response) => {
  try {
    const channels = await getTeamsChannels()
    res.json(channels)
  } catch (error) {
    console.error("[TEAMS] Get channels error:", error)
    res.status(500).json({ error: "Failed to fetch Teams channels" })
  }
})

// Get channel messages
router.get("/channels/:channelId/messages", async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params
    const messages = await getTeamsMessages(channelId)
    res.json(messages)
  } catch (error) {
    console.error("[TEAMS] Get messages error:", error)
    res.status(500).json({ error: "Failed to fetch Teams messages" })
  }
})

// Sync Teams data
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const result = await fetchTeamsData()
    res.json({ message: "Teams data synced successfully", result })
  } catch (error) {
    console.error("[TEAMS] Sync error:", error)
    res.status(500).json({ error: "Failed to sync Teams data" })
  }
})

export default router
