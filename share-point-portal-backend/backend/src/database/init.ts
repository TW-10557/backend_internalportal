import { query } from "./connection"

export async function initializeDatabase() {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        azure_id VARCHAR(255),
        avatar_url TEXT,
        role VARCHAR(50) DEFAULT 'user',
        theme_preference VARCHAR(20) DEFAULT 'light',
        timezone VARCHAR(50) DEFAULT 'UTC',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // News table
    await query(`
      CREATE TABLE IF NOT EXISTS news (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100),
        featured BOOLEAN DEFAULT FALSE,
        image_url TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      );
    `)

    // Events table
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location VARCHAR(255),
        organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        teams_channel_id VARCHAR(255),
        attendees UUID[] DEFAULT ARRAY[]::UUID[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Documents table
    await query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50),
        file_size BIGINT,
        uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100),
        tags TEXT[],
        sharepoint_id VARCHAR(255),
        is_shared BOOLEAN DEFAULT FALSE,
        shared_with UUID[] DEFAULT ARRAY[]::UUID[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Announcements table
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        priority VARCHAR(20) DEFAULT 'normal',
        is_urgent BOOLEAN DEFAULT FALSE,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        visible_to_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      );
    `)

    // Teams Channels table
    await query(`
      CREATE TABLE IF NOT EXISTS teams_channels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teams_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        last_synced TIMESTAMP,
        message_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Teams Messages table
    await query(`
      CREATE TABLE IF NOT EXISTS teams_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teams_message_id VARCHAR(255) NOT NULL UNIQUE,
        channel_id UUID NOT NULL REFERENCES teams_channels(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
        sender_name VARCHAR(255),
        content TEXT,
        attachments JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Portal Preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS portal_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        notifications_enabled BOOLEAN DEFAULT TRUE,
        email_digest_frequency VARCHAR(50) DEFAULT 'daily',
        display_announcements BOOLEAN DEFAULT TRUE,
        display_events BOOLEAN DEFAULT TRUE,
        display_news BOOLEAN DEFAULT TRUE,
        display_documents BOOLEAN DEFAULT TRUE,
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Activity Log table
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(255),
        resource_type VARCHAR(100),
        resource_id UUID,
        metadata JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create indexes for performance
    await query(`CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_documents_uploader ON documents(uploaded_by);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_announcements_author ON announcements(author_id);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_teams_messages_channel ON teams_messages(channel_id);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);`)
    await query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);`)

    console.log("[DB] Database tables initialized successfully")
  } catch (error) {
    console.error("[DB] Database initialization error:", error)
    throw error
  }
}
