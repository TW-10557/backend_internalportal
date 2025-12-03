# SharePoint-like Portal - Backend Setup Guide

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start (Local Development)

### 1. Clone and Setup Backend

\`\`\`bash
# Clone your frontend repository
git clone https://github.com/TW-10557/share-point-like-portal.git
cd share-point-like-portal

# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Copy the backend files into this directory
# (Files: src/, package.json, tsconfig.json, .env.example)

# Install dependencies
npm install
\`\`\`

### 2. Setup PostgreSQL Database

#### Option A: Using PostgreSQL Locally

\`\`\`bash
# Create a new database
createdb sharepoint_portal

# Verify connection
psql sharepoint_portal -c "SELECT version();"
\`\`\`

#### Option B: Using Docker (Recommended)

\`\`\`bash
docker run --name postgres-portal \\
  -e POSTGRES_DB=sharepoint_portal \\
  -e POSTGRES_USER=portaluser \\
  -e POSTGRES_PASSWORD=portalpass123 \\
  -p 5432:5432 \\
  -d postgres:16
\`\`\`

### 3. Configure Environment Variables

\`\`\`bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
\`\`\`

**Required Environment Variables:**

\`\`\`env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=postgresql://portaluser:portalpass123@localhost:5432/sharepoint_portal
CORS_ORIGIN=http://localhost:3000
\`\`\`

### 4. Start the Backend Server

\`\`\`bash
npm run dev
\`\`\`

Expected output:
\`\`\`
[SERVER] Initializing database...
[DB] Database tables initialized successfully
[SERVER] Server running on http://localhost:5000
[SERVER] WebSocket available at ws://localhost:5000
\`\`\`

### 5. Connect Frontend to Backend

In your frontend project (`app/lib/api.ts` or similar):

\`\`\`typescript
const API_BASE_URL = 'http://localhost:5000/api';

export async function login(email: string, password: string) {
  const response = await fetch(`\${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// Connect WebSocket for real-time updates
export function connectWebSocket(token: string) {
  const ws = new WebSocket(`ws://localhost:5000?token=\${token}`);
  return ws;
}
\`\`\`

---

## 🔐 Microsoft Teams Integration

### Setup Azure AD Application

1. **Go to Azure Portal**: https://portal.azure.com

2. **Create App Registration**:
   - Navigate to: Azure AD → App Registrations → New Registration
   - Name: "SharePoint Portal Backend"
   - Supported Account Types: Select "Accounts in this organizational directory only"
   - Redirect URI: `http://localhost:5000/auth/callback`
   - Click Register

3. **Configure API Permissions**:
   - Click "API Permissions"
   - Add Permissions → Microsoft Graph
   - Select Application Permissions:
     - `Team.ReadAll`
     - `ChannelMessage.Read.All`
     - `Mail.ReadBasic.All`
     - `Calendar.ReadBasic.All`
   - Click Grant admin consent

4. **Get Credentials**:
   - Click "Certificates & secrets"
   - New Client Secret
   - Copy the value and secret
   - Copy Application (client) ID from Overview

5. **Update .env**:

\`\`\`env
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
MICROSOFT_GRAPH_TOKEN=your-graph-api-token
\`\`\`

### Mock Data (for development without Teams integration)

The backend provides mock Teams data by default. Real Teams data will be fetched automatically when `MICROSOFT_GRAPH_TOKEN` is configured.

---

## 🗄️ Database Migrations

### Create Tables

Tables are automatically created on first server startup. If you need to manually run migrations:

\`\`\`bash
npm run migrate
\`\`\`

### Seed Demo Data

\`\`\`bash
npm run seed
\`\`\`

This creates sample users, news, events, and announcements.

---

## 🔌 API Endpoints

### Authentication

\`\`\`
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login with email/password
POST   /api/auth/azure-login      - Login with Azure AD
GET    /api/auth/me               - Get current user
\`\`\`

### News

\`\`\`
GET    /api/news                  - Get all news
GET    /api/news/:id              - Get single news
POST   /api/news                  - Create news (requires auth)
PUT    /api/news/:id              - Update news
DELETE /api/news/:id              - Delete news
\`\`\`

### Events

\`\`\`
GET    /api/events                - Get all events
GET    /api/events/:id            - Get single event
POST   /api/events                - Create event
POST   /api/events/:id/rsvp       - RSVP to event
PUT    /api/events/:id            - Update event
\`\`\`

### Documents

\`\`\`
GET    /api/documents             - Get all documents
POST   /api/documents/upload      - Upload document
POST   /api/documents/:id/share   - Share document
\`\`\`

### Announcements

\`\`\`
GET    /api/announcements         - Get all announcements
POST   /api/announcements         - Create announcement
\`\`\`

### Teams

\`\`\`
GET    /api/teams/channels        - Get Teams channels
GET    /api/teams/channels/:id/messages - Get channel messages
POST   /api/teams/sync            - Manually sync Teams data
\`\`\`

### Users

\`\`\`
GET    /api/users/profile         - Get user profile
PUT    /api/users/profile         - Update profile
GET    /api/users/preferences     - Get preferences
PUT    /api/users/preferences     - Update preferences
\`\`\`

---

## 📡 Real-time Updates with WebSocket

### Connect to WebSocket

\`\`\`typescript
const token = localStorage.getItem('authToken');
const ws = new WebSocket(\`ws://localhost:5000?token=\${token}\`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Real-time update:', message);
};
\`\`\`

### Subscribe to Updates

\`\`\`typescript
ws.send(JSON.stringify({
  type: 'subscribe',
  data: { channel: 'news' }
}));
\`\`\`

---

## 🚀 Deployment

### Deploy to Render

1. **Create Render Account**: https://render.com

2. **Connect GitHub Repository**:
   - New → Web Service
   - Connect GitHub
   - Select your repository
   - Branch: `main`

3. **Configure**:
   - Name: `sharepoint-portal-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free (or paid for production)

4. **Add Environment Variables**:
   - Click Environment
   - Add all variables from `.env`
   - For production, use strong JWT_SECRET
   - Update DATABASE_URL to production Postgres

5. **Deploy Database**:
   - Create PostgreSQL database on Render
   - Copy connection URL to DATABASE_URL

### Deploy to Railway

1. **Create Railway Account**: https://railway.app

2. **New Project**:
   - GitHub repo
   - Select this repository
   - Confirm deploy

3. **Add PostgreSQL**:
   - Plugins → PostgreSQL
   - Automatically connects

4. **Set Variables**:
   - Variables tab
   - Add from `.env`

5. **Deploy**:
   - Changes to main branch auto-deploy

### Deploy to Vercel (Frontend + API Routes)

1. **Update Frontend**:

\`\`\`typescript
// pages/api/[...slug].ts - Proxy to backend
export default async function handler(req, res) {
  const response = await fetch(
    \`\${process.env.NEXT_PUBLIC_API_URL}\${req.url}\`,
    { method: req.method, body: req.body }
  );
  const data = await response.json();
  res.status(response.status).json(data);
}
\`\`\`

2. **Deploy Both Projects**:
   - Frontend: Vercel
   - Backend: Render or Railway (or Railway with Vercel Functions)

---

## 🔧 Troubleshooting

### Database Connection Error

\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:5432
\`\`\`

**Solution**:
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format
- Confirm database name and credentials

### WebSocket Connection Error

\`\`\`
WebSocket error: Unauthorized: Token required
\`\`\`

**Solution**:
- Ensure token is included in URL: `ws://localhost:5000?token=YOUR_TOKEN`
- Verify token is valid: Check JWT_SECRET matches

### Azure AD Integration Not Working

**Solution**:
- Verify credentials in Azure Portal
- Check API permissions are granted
- Test with Microsoft Graph Explorer

### CORS Issues

\`\`\`
Access to XMLHttpRequest blocked by CORS
\`\`\`

**Solution**:
- Update CORS_ORIGIN in .env
- Include frontend URL: \`http://localhost:3000\`

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)
- [JWT Authentication](https://jwt.io/)
- [WebSocket Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## 🆘 Support

For issues or questions:
1. Check logs: \`npm run dev\`
2. Review error messages in console
3. Check GitHub Issues
4. Create a detailed issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

**Happy coding! 🎉**
