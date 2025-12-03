# SharePoint Portal - API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token in Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

---

## Endpoints

### Authentication

#### Register User
\`\`\`
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "secure_password"
}

Response (201):
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token"
}
\`\`\`

#### Login
\`\`\`
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response (200):
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "theme_preference": "light",
    "timezone": "UTC"
  },
  "token": "jwt_token"
}
\`\`\`

#### Azure AD Login
\`\`\`
POST /auth/azure-login
Content-Type: application/json
Authorization: Bearer <azure_token>

{
  "token": "azure_token"
}

Response (200):
{
  "message": "Azure login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token"
}
\`\`\`

#### Get Current User
\`\`\`
GET /auth/me
Authorization: Bearer <jwt_token>

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "azure_id": "azure_id",
  "role": "user",
  "theme_preference": "light",
  "timezone": "UTC",
  "created_at": "2024-01-15T10:00:00Z",
  "last_login": "2024-01-20T15:30:00Z"
}
\`\`\`

---

### News

#### Get All News
\`\`\`
GET /news?limit=10&offset=0&featured=false
Authorization: Bearer <jwt_token>

Response (200):
{
  "items": [
    {
      "id": "uuid",
      "title": "Company News",
      "content": "News content...",
      "author_id": "uuid",
      "author_name": "John Doe",
      "category": "Updates",
      "featured": true,
      "image_url": "https://...",
      "tags": ["important", "update"],
      "created_at": "2024-01-15T10:00:00Z",
      "published_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
\`\`\`

#### Get Single News
\`\`\`
GET /news/:id
Authorization: Bearer <jwt_token>

Response (200):
{
  "id": "uuid",
  "title": "Company News",
  ...
}
\`\`\`

#### Create News (Admin)
\`\`\`
POST /news
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "New Company News",
  "content": "This is important news...",
  "category": "Updates",
  "image_url": "https://...",
  "tags": ["important"],
  "featured": true
}

Response (201):
{
  "id": "uuid",
  "title": "New Company News",
  ...
}
\`\`\`

#### Update News
\`\`\`
PUT /news/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "featured": false
}

Response (200):
{
  "id": "uuid",
  "title": "Updated Title",
  ...
}
\`\`\`

#### Delete News
\`\`\`
DELETE /news/:id
Authorization: Bearer <jwt_token>

Response (200):
{
  "message": "News deleted successfully"
}
\`\`\`

---

### Events

#### Get All Events
\`\`\`
GET /events?limit=20&offset=0&upcoming=true
Authorization: Bearer <jwt_token>

Response (200):
{
  "items": [
    {
      "id": "uuid",
      "title": "Team Meeting",
      "description": "Weekly sync",
      "start_time": "2024-01-25T14:00:00Z",
      "end_time": "2024-01-25T15:00:00Z",
      "location": "Conference Room A",
      "organizer_id": "uuid",
      "organizer_name": "John Doe",
      "attendees": ["uuid1", "uuid2"],
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
\`\`\`

#### Get Single Event
\`\`\`
GET /events/:id
Authorization: Bearer <jwt_token>

Response (200):
{
  "id": "uuid",
  ...
}
\`\`\`

#### Create Event
\`\`\`
POST /events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly sync",
  "start_time": "2024-01-25T14:00:00Z",
  "end_time": "2024-01-25T15:00:00Z",
  "location": "Conference Room A"
}

Response (201):
{
  "id": "uuid",
  ...
}
\`\`\`

#### RSVP to Event
\`\`\`
POST /events/:id/rsvp
Authorization: Bearer <jwt_token>

Response (200):
{
  "id": "uuid",
  "attendees": ["uuid1", "uuid2", "uuid3"]
}
\`\`\`

#### Update Event
\`\`\`
PUT /events/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Meeting Title",
  "end_time": "2024-01-25T16:00:00Z"
}

Response (200):
{
  "id": "uuid",
  ...
}
\`\`\`

---

### Documents

#### Get All Documents
\`\`\`
GET /documents?limit=20&offset=0&category=reports
Authorization: Bearer <jwt_token>

Response (200):
{
  "items": [
    {
      "id": "uuid",
      "title": "Report.pdf",
      "file_name": "report.pdf",
      "file_type": ".pdf",
      "file_size": 2048000,
      "category": "reports",
      "tags": ["financial", "2024"],
      "uploaded_by": "uuid",
      "uploaded_by_name": "Jane Smith",
      "is_shared": true,
      "shared_with": ["uuid1", "uuid2"],
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
\`\`\`

#### Upload Document
\`\`\`
POST /documents/upload
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "title": "Q1 Report",
  "category": "reports",
  "tags": ["financial", "2024"]
}

Response (201):
{
  "id": "uuid",
  "title": "Q1 Report",
  "file_name": "report.pdf",
  ...
}
\`\`\`

#### Share Document
\`\`\`
POST /documents/:id/share
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "shared_with": ["uuid1", "uuid2", "uuid3"]
}

Response (200):
{
  "id": "uuid",
  "is_shared": true,
  "shared_with": ["uuid1", "uuid2", "uuid3"]
}
\`\`\`

---

### Announcements

#### Get All Announcements
\`\`\`
GET /announcements?limit=10&offset=0
Authorization: Bearer <jwt_token>

Response (200):
{
  "items": [
    {
      "id": "uuid",
      "title": "System Maintenance",
      "content": "Scheduled maintenance...",
      "author_id": "uuid",
      "author_name": "Admin",
      "priority": "high",
      "is_urgent": true,
      "start_date": "2024-01-15T10:00:00Z",
      "end_date": "2024-01-20T18:00:00Z",
      "published_at": "2024-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
\`\`\`

#### Create Announcement (Admin)
\`\`\`
POST /announcements
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Important Announcement",
  "content": "Content of the announcement",
  "priority": "high",
  "is_urgent": true,
  "end_date": "2024-01-25T18:00:00Z",
  "visible_to_roles": ["user", "admin"]
}

Response (201):
{
  "id": "uuid",
  ...
}
\`\`\`

---

### Teams Integration

#### Get Teams Channels
\`\`\`
GET /teams/channels
Authorization: Bearer <jwt_token>

Response (200):
[
  {
    "id": "channel-1",
    "name": "General",
    "description": "General discussions",
    "messages": [...]
  },
  {
    "id": "channel-2",
    "name": "Announcements",
    "description": "Company announcements",
    "messages": [...]
  }
]
\`\`\`

#### Get Channel Messages
\`\`\`
GET /teams/channels/:channelId/messages
Authorization: Bearer <jwt_token>

Response (200):
[
  {
    "id": "msg-1",
    "sender": "John Doe",
    "content": "Message content",
    "timestamp": "2024-01-15T10:00:00Z",
    "attachments": []
  }
]
\`\`\`

#### Sync Teams Data
\`\`\`
POST /teams/sync
Authorization: Bearer <jwt_token>

Response (200):
{
  "message": "Teams data synced successfully",
  "result": {
    "channelsCount": 5
  }
}
\`\`\`

---

### User Management

#### Get User Profile
\`\`\`
GET /users/profile
Authorization: Bearer <jwt_token>

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "theme_preference": "light",
  "timezone": "UTC"
}
\`\`\`

#### Update User Profile
\`\`\`
PUT /users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "theme_preference": "dark",
  "timezone": "America/New_York",
  "avatar_url": "https://..."
}

Response (200):
{
  "id": "uuid",
  "name": "Jane Doe",
  ...
}
\`\`\`

#### Get User Preferences
\`\`\`
GET /users/preferences
Authorization: Bearer <jwt_token>

Response (200):
{
  "id": "uuid",
  "user_id": "uuid",
  "notifications_enabled": true,
  "email_digest_frequency": "daily",
  "language": "en",
  "display_announcements": true,
  "display_events": true,
  "display_news": true,
  "display_documents": true
}
\`\`\`

#### Update User Preferences
\`\`\`
PUT /users/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notifications_enabled": false,
  "email_digest_frequency": "weekly",
  "language": "es",
  "display_announcements": true
}

Response (200):
{
  "id": "uuid",
  ...
}
\`\`\`

---

## Error Responses

All errors follow this format:

\`\`\`
{
  "error": "Error message describing what went wrong"
}
\`\`\`

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## WebSocket Events

### Connection
\`\`\`
ws://localhost:5000?token=<jwt_token>
\`\`\`

### Subscribe to Updates
\`\`\`json
{
  "type": "subscribe",
  "data": { "channel": "news" }
}
\`\`\`

### Receive Update
\`\`\`json
{
  "type": "update",
  "resource": "news",
  "action": "created",
  "data": { ... },
  "timestamp": "2024-01-15T10:00:00Z"
}
\`\`\`

### Ping/Pong
\`\`\`json
{
  "type": "ping"
}
\`\`\`

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authentication**: 5 attempts per minute

---

## Pagination

All list endpoints support pagination:
- `limit`: Number of items (default: 10-20)
- `offset`: Number of items to skip (default: 0)

Example: `/api/news?limit=20&offset=40`

---

## Timestamps

All timestamps are in ISO 8601 format (UTC):
\`\`\`
2024-01-15T10:00:00Z
\`\`\`

---

## Authentication Methods

### JWT Token
Most common for API requests:
\`\`\`
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
\`\`\`

### Azure AD
For single sign-on:
\`\`\`
POST /auth/azure-login with Azure token
\`\`\`

---

## Testing with cURL

\`\`\`bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get news (with token)
curl -X GET http://localhost:5000/api/news \
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

---

## SDK Usage

### JavaScript/TypeScript

\`\`\`typescript
import { newsAPI, eventsAPI, authAPI } from '@/lib/api';

// Login
const response = await authAPI.login('user@example.com', 'password');
localStorage.setItem('authToken', response.token);

// Get news
const news = await newsAPI.getAll(10, 0);

// Create event
const event = await eventsAPI.create({
  title: 'Meeting',
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 3600000).toISOString(),
});
\`\`\`

---

For more information, visit the [Setup Guide](./SETUP.md)
