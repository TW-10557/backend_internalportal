import { Router, type Request, type Response } from "express"
import { query } from "../database/connection"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// Get all news
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0, featured } = req.query

    let q = "SELECT n.*, u.name as author_name FROM news n JOIN users u ON n.author_id = u.id"
    const params: any[] = []

    if (featured === "true") {
      q += " WHERE n.featured = TRUE"
    }

    q += " ORDER BY n.published_at DESC NULLS LAST, n.created_at DESC LIMIT $1 OFFSET $2"
    params.push(limit, offset)

    const result = await query(q, params)
    res.json({
      items: result.rows,
      count: result.rowCount,
    })
  } catch (error) {
    console.error("[NEWS] Get all error:", error)
    res.status(500).json({ error: "Failed to fetch news" })
  }
})

// Get single news item
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await query("SELECT * FROM news WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "News not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[NEWS] Get single error:", error)
    res.status(500).json({ error: "Failed to fetch news" })
  }
})

// Create news (admin only)
router.post("/", async (req: any, res: Response) => {
  try {
    const { title, content, category, image_url, tags, featured } = req.body
    const author_id = req.user.userId

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content required" })
    }

    const id = uuidv4()
    const result = await query(
      `INSERT INTO news (id, title, content, author_id, category, image_url, tags, featured, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [id, title, content, author_id, category, image_url, tags || [], featured || false],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("[NEWS] Create error:", error)
    res.status(500).json({ error: "Failed to create news" })
  }
})

// Update news
router.put("/:id", async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, category, image_url, tags, featured } = req.body

    const result = await query(
      `UPDATE news 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content),
           category = COALESCE($3, category),
           image_url = COALESCE($4, image_url),
           tags = COALESCE($5, tags),
           featured = COALESCE($6, featured),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, content, category, image_url, tags, featured, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "News not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[NEWS] Update error:", error)
    res.status(500).json({ error: "Failed to update news" })
  }
})

// Delete news
router.delete("/:id", async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const result = await query("DELETE FROM news WHERE id = $1 RETURNING *", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "News not found" })
    }

    res.json({ message: "News deleted successfully" })
  } catch (error) {
    console.error("[NEWS] Delete error:", error)
    res.status(500).json({ error: "Failed to delete news" })
  }
})

export default router
