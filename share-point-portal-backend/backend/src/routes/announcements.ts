import { Router, type Request, type Response } from "express"
import { query } from "../database/connection"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// Get all announcements
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query

    const result = await query(
      `SELECT a.*, u.name as author_name 
       FROM announcements a 
       JOIN users u ON a.author_id = u.id
       WHERE a.start_date <= NOW() AND (a.end_date IS NULL OR a.end_date >= NOW())
       ORDER BY a.is_urgent DESC, a.published_at DESC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    )

    res.json({
      items: result.rows,
      count: result.rowCount,
    })
  } catch (error) {
    console.error("[ANNOUNCEMENTS] Get all error:", error)
    res.status(500).json({ error: "Failed to fetch announcements" })
  }
})

// Create announcement (admin only)
router.post("/", async (req: any, res: Response) => {
  try {
    const { title, content, priority, is_urgent, end_date, visible_to_roles } = req.body
    const author_id = req.user.userId

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" })
    }

    const id = uuidv4()
    const result = await query(
      `INSERT INTO announcements (id, title, content, author_id, priority, is_urgent, end_date, visible_to_roles, published_at, start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [id, title, content, author_id, priority || "normal", is_urgent || false, end_date, visible_to_roles || []],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("[ANNOUNCEMENTS] Create error:", error)
    res.status(500).json({ error: "Failed to create announcement" })
  }
})

export default router
