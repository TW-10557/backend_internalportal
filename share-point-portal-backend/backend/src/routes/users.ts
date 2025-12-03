import { Router, type Response } from "express"
import { query } from "../database/connection"

const router = Router()

// Get user profile
router.get("/profile", async (req: any, res: Response) => {
  try {
    const userId = req.user.userId
    const result = await query("SELECT * FROM users WHERE id = $1", [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[USERS] Get profile error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update user profile
router.put("/profile", async (req: any, res: Response) => {
  try {
    const userId = req.user.userId
    const { name, theme_preference, timezone, avatar_url } = req.body

    const result = await query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           theme_preference = COALESCE($2, theme_preference),
           timezone = COALESCE($3, timezone),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, theme_preference, timezone, avatar_url, userId],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[USERS] Update profile error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// Get user preferences
router.get("/preferences", async (req: any, res: Response) => {
  try {
    const userId = req.user.userId
    const result = await query("SELECT * FROM portal_preferences WHERE user_id = $1", [userId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Preferences not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[USERS] Get preferences error:", error)
    res.status(500).json({ error: "Failed to fetch preferences" })
  }
})

// Update user preferences
router.put("/preferences", async (req: any, res: Response) => {
  try {
    const userId = req.user.userId
    const {
      notifications_enabled,
      email_digest_frequency,
      language,
      display_announcements,
      display_events,
      display_news,
      display_documents,
    } = req.body

    const result = await query(
      `UPDATE portal_preferences 
       SET notifications_enabled = COALESCE($1, notifications_enabled),
           email_digest_frequency = COALESCE($2, email_digest_frequency),
           language = COALESCE($3, language),
           display_announcements = COALESCE($4, display_announcements),
           display_events = COALESCE($5, display_events),
           display_news = COALESCE($6, display_news),
           display_documents = COALESCE($7, display_documents),
           updated_at = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [
        notifications_enabled,
        email_digest_frequency,
        language,
        display_announcements,
        display_events,
        display_news,
        display_documents,
        userId,
      ],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Preferences not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[USERS] Update preferences error:", error)
    res.status(500).json({ error: "Failed to update preferences" })
  }
})

export default router
