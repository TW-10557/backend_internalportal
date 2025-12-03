import { Router, type Request, type Response } from "express"
import { query } from "../database/connection"
import { v4 as uuidv4 } from "uuid"

const router = Router()

// Get all events
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, upcoming = "true" } = req.query

    let q = `SELECT e.*, u.name as organizer_name 
             FROM events e 
             JOIN users u ON e.organizer_id = u.id`
    const params: any[] = []

    if (upcoming === "true") {
      q += " WHERE e.start_time >= NOW()"
    }

    q += " ORDER BY e.start_time ASC LIMIT $1 OFFSET $2"
    params.push(limit, offset)

    const result = await query(q, params)
    res.json({
      items: result.rows,
      count: result.rowCount,
    })
  } catch (error) {
    console.error("[EVENTS] Get all error:", error)
    res.status(500).json({ error: "Failed to fetch events" })
  }
})

// Get single event
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await query("SELECT * FROM events WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[EVENTS] Get single error:", error)
    res.status(500).json({ error: "Failed to fetch event" })
  }
})

// Create event
router.post("/", async (req: any, res: Response) => {
  try {
    const { title, description, start_time, end_time, location } = req.body
    const organizer_id = req.user.userId

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: "Title, start_time, and end_time required" })
    }

    const id = uuidv4()
    const result = await query(
      `INSERT INTO events (id, title, description, start_time, end_time, location, organizer_id, attendees)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, title, description, start_time, end_time, location, organizer_id, [organizer_id]],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("[EVENTS] Create error:", error)
    res.status(500).json({ error: "Failed to create event" })
  }
})

// RSVP to event
router.post("/:id/rsvp", async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const result = await query(
      `UPDATE events 
       SET attendees = array_append(attendees, $1)
       WHERE id = $2 AND NOT attendees @> ARRAY[$1]::UUID[]
       RETURNING *`,
      [userId, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found or already RSVP'd" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[EVENTS] RSVP error:", error)
    res.status(500).json({ error: "Failed to RSVP" })
  }
})

// Update event
router.put("/:id", async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, start_time, end_time, location } = req.body

    const result = await query(
      `UPDATE events 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           location = COALESCE($5, location),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description, start_time, end_time, location, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[EVENTS] Update error:", error)
    res.status(500).json({ error: "Failed to update event" })
  }
})

export default router
