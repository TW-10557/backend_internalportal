import { query } from "../src/database/connection"
import { v4 as uuidv4 } from "uuid"

const seedDatabase = async () => {
  try {
    console.log("[SEED] Starting database seeding...")

    // Create sample users
    const userId1 = uuidv4()
    const userId2 = uuidv4()
    const userId3 = uuidv4()

    await query(
      `INSERT INTO users (id, email, name, role) VALUES 
       ($1, $2, $3, 'admin'),
       ($4, $5, $6, 'user'),
       ($7, $8, $9, 'user')
       ON CONFLICT (email) DO NOTHING`,
      [
        userId1,
        "admin@example.com",
        "Admin User",
        userId2,
        "john@example.com",
        "John Doe",
        userId3,
        "jane@example.com",
        "Jane Smith",
      ],
    )

    // Create sample news
    const newsId1 = uuidv4()
    const newsId2 = uuidv4()

    await query(
      `INSERT INTO news (id, title, content, author_id, category, featured, published_at) VALUES
       ($1, $2, $3, $4, 'Updates', true, NOW()),
       ($5, $6, $7, $8, 'Announcements', false, NOW())
       ON CONFLICT DO NOTHING`,
      [
        newsId1,
        "Welcome to SharePoint Portal",
        "This is the new company portal for sharing documents and announcements.",
        userId1,
        newsId2,
        "Q1 Company Results",
        "Great quarter with 25% growth in revenue!",
        userId1,
      ],
    )

    // Create sample events
    const eventId1 = uuidv4()
    const eventId2 = uuidv4()

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    const futureDate2 = new Date()
    futureDate2.setDate(futureDate2.getDate() + 14)

    await query(
      `INSERT INTO events (id, title, description, start_time, end_time, location, organizer_id, attendees) VALUES
       ($1, $2, $3, $4, $5, 'Conference Room A', $6, $7),
       ($8, $9, $10, $11, $12, 'Virtual Meeting', $13, $14)
       ON CONFLICT DO NOTHING`,
      [
        eventId1,
        "Team Meeting",
        "Weekly team sync to discuss progress",
        futureDate,
        new Date(futureDate.getTime() + 3600000),
        userId1,
        [userId1, userId2],
        eventId2,
        "Company All-Hands",
        "Quarterly company meeting",
        futureDate2,
        new Date(futureDate2.getTime() + 7200000),
        userId1,
        [userId1, userId2, userId3],
      ],
    )

    // Create sample announcements
    const announcementId = uuidv4()

    await query(
      `INSERT INTO announcements (id, title, content, author_id, priority, is_urgent, published_at, start_date) VALUES
       ($1, $2, $3, $4, 'high', true, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [announcementId, "System Maintenance", "Server maintenance scheduled for this weekend.", userId1],
    )

    console.log("[SEED] Database seeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[SEED] Seeding error:", error)
    process.exit(1)
  }
}

seedDatabase()
