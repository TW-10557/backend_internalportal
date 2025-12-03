import { Router, type Request, type Response } from "express"
import bcrypt from "bcryptjs"
import { query } from "../database/connection"
import { generateToken } from "../middleware/auth"

const router = Router()

// Mock Azure AD integration - in production, use @azure/msal-node
const MOCK_AZURE_USERS: Record<string, any> = {
  "user@example.com": {
    id: "azure-user-1",
    email: "user@example.com",
    name: "John Doe",
  },
}

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Email, name, and password required" })
    }

    // Check if user exists
    const existing = await query("SELECT * FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await query(
      `INSERT INTO users (email, name, role, timezone) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, role`,
      [email, name, "user", "UTC"],
    )

    const user = result.rows[0]

    // Create default preferences
    await query(`INSERT INTO portal_preferences (user_id) VALUES ($1)`, [user.id])

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    })
  } catch (error) {
    console.error("[AUTH] Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    // Find user
    const result = await query("SELECT * FROM users WHERE email = $1", [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const user = result.rows[0]

    // In production, verify hashed password
    // For now, accept any password for demo
    if (password.length < 6) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Update last login
    await query("UPDATE users SET last_login = NOW() WHERE id = $1", [user.id])

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        theme_preference: user.theme_preference,
        timezone: user.timezone,
      },
      token,
    })
  } catch (error) {
    console.error("[AUTH] Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Azure AD login (mock)
router.post("/azure-login", async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: "Azure token required" })
    }

    // In production, verify token with Azure AD
    // For now, use mock data
    const mockUser = MOCK_AZURE_USERS["user@example.com"]

    if (!mockUser) {
      return res.status(401).json({ error: "User not found in Azure AD" })
    }

    // Check if user exists in local database
    const result = await query("SELECT * FROM users WHERE email = $1", [mockUser.email])

    let user = result.rows[0]
    if (!user) {
      // Create new user from Azure AD
      const createResult = await query(
        `INSERT INTO users (email, name, azure_id, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, name, role`,
        [mockUser.email, mockUser.name, mockUser.id, "user"],
      )
      user = createResult.rows[0]

      // Create default preferences
      await query(`INSERT INTO portal_preferences (user_id) VALUES ($1)`, [user.id])
    }

    // Update last login and Azure ID
    await query("UPDATE users SET last_login = NOW(), azure_id = $1 WHERE id = $2", [mockUser.id, user.id])

    // Generate JWT token
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      azureId: mockUser.id,
    })

    res.json({
      message: "Azure login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: jwtToken,
    })
  } catch (error) {
    console.error("[AUTH] Azure login error:", error)
    res.status(500).json({ error: "Azure login failed" })
  }
})

// Get current user
router.get("/me", async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    const result = await query("SELECT * FROM users WHERE id = $1", [req.user.userId])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("[AUTH] Get user error:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

export default router
