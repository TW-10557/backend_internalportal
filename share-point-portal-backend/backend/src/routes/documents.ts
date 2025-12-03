import { Router, type Request, type Response } from "express"
import { query } from "../database/connection"
import { v4 as uuidv4 } from "uuid"
import multer from "multer"
import path from "path"

const router = Router()

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip)$/i
    if (allowed.test(file.originalname)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

// Get all documents
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0, category } = req.query

    let q = `SELECT d.*, u.name as uploaded_by_name 
             FROM documents d 
             JOIN users u ON d.uploaded_by = u.id`
    const params: any[] = []

    if (category) {
      q += " WHERE d.category = $1"
      params.push(category)
    }

    q += " ORDER BY d.created_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2)
    params.push(limit, offset)

    const result = await query(q, params)
    res.json({
      items: result.rows,
      count: result.rowCount,
    })
  } catch (error) {
    console.error("[DOCUMENTS] Get all error:", error)
    res.status(500).json({ error: "Failed to fetch documents" })
  }
})

// Upload document
router.post("/upload", upload.single("file"), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" })
    }

    const { title, category, tags } = req.body
    const uploaded_by = req.user.userId

    const id = uuidv4()
    const result = await query(
      `INSERT INTO documents (id, title, file_name, file_path, file_type, file_size, uploaded_by, category, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        title || req.file.originalname,
        req.file.originalname,
        req.file.path,
        path.extname(req.file.originalname),
        req.file.size,
        uploaded_by,
        category,
        tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      ],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("[DOCUMENTS] Upload error:", error)
    res.status(500).json({ error: "Failed to upload document" })
  }
})

// Share document
router.post("/:id/share", async (req: any, res: Response) => {
  try {
    const { id } = req.params
    const { shared_with } = req.body

    if (!Array.isArray(shared_with)) {
      return res.status(400).json({ error: "shared_with must be an array" })
    }

    const result = await query(
      `UPDATE documents 
       SET shared_with = $1, is_shared = TRUE, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [shared_with, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[DOCUMENTS] Share error:", error)
    res.status(500).json({ error: "Failed to share document" })
  }
})

export default router
