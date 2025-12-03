import { initializeDatabase } from "../src/database/init"

const runMigrations = async () => {
  try {
    console.log("[MIGRATE] Running database migrations...")
    await initializeDatabase()
    console.log("[MIGRATE] Migrations completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("[MIGRATE] Migration error:", error)
    process.exit(1)
  }
}

runMigrations()
