import axios from "axios"
import { query } from "../database/connection"
import { v4 as uuidv4 } from "uuid"

const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"

// Mock Teams data - replace with real API calls when credentials are available
const MOCK_TEAMS_CHANNELS = [
  {
    id: "channel-1",
    name: "General",
    description: "General discussions",
    messages: [
      {
        id: "msg-1",
        sender: "John Doe",
        content: "Welcome to the portal!",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "msg-2",
        sender: "Jane Smith",
        content: "Great to have everyone here",
        timestamp: new Date(Date.now() - 1800000),
      },
    ],
  },
  {
    id: "channel-2",
    name: "Announcements",
    description: "Important company announcements",
    messages: [
      {
        id: "msg-3",
        sender: "Admin",
        content: "New policy updates available",
        timestamp: new Date(),
      },
    ],
  },
]

export async function getTeamsChannels() {
  try {
    // Check if we have real Teams integration
    if (process.env.MICROSOFT_GRAPH_TOKEN) {
      return await fetchRealTeamsChannels()
    }

    // Return mock data
    return MOCK_TEAMS_CHANNELS
  } catch (error) {
    console.error("[TEAMS SERVICE] Get channels error:", error)
    // Fall back to mock data
    return MOCK_TEAMS_CHANNELS
  }
}

export async function getTeamsMessages(channelId: string) {
  try {
    if (process.env.MICROSOFT_GRAPH_TOKEN) {
      return await fetchRealTeamsMessages(channelId)
    }

    // Return mock messages
    const channel = MOCK_TEAMS_CHANNELS.find((c) => c.id === channelId)
    return channel?.messages || []
  } catch (error) {
    console.error("[TEAMS SERVICE] Get messages error:", error)
    return []
  }
}

export async function fetchTeamsData() {
  try {
    const channels = await getTeamsChannels()

    // Store in database
    for (const channel of channels) {
      const existing = await query("SELECT * FROM teams_channels WHERE teams_id = $1", [channel.id])

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO teams_channels (id, teams_id, name, description, message_count)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), channel.id, channel.name, channel.description, channel.messages?.length || 0],
        )
      }
    }

    console.log("[TEAMS SERVICE] Data synced successfully")
    return { channelsCount: channels.length }
  } catch (error) {
    console.error("[TEAMS SERVICE] Sync error:", error)
    throw error
  }
}

async function fetchRealTeamsChannels() {
  // Real implementation would use Microsoft Graph API
  const response = await axios.get(`${GRAPH_API_BASE}/teams/{teamId}/channels`, {
    headers: {
      Authorization: `Bearer ${process.env.MICROSOFT_GRAPH_TOKEN}`,
    },
  })
  return response.data.value
}

async function fetchRealTeamsMessages(channelId: string) {
  // Real implementation would use Microsoft Graph API
  const response = await axios.get(`${GRAPH_API_BASE}/teams/{teamId}/channels/${channelId}/messages`, {
    headers: {
      Authorization: `Bearer ${process.env.MICROSOFT_GRAPH_TOKEN}`,
    },
  })
  return response.data.value
}
