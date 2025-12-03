# SharePoint-like Portal - Full Stack Integration Guide

This guide walks you through integrating your existing frontend UI with the new dynamic backend.

---

## 📊 Architecture Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                    │
│         (Your existing UI @ localhost:3000)                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP/REST API + WebSocket
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Backend (Express.js)                       │
│         (New API server @ localhost:5000)                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ SQL Queries
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              PostgreSQL Database                            │
│    (Stores: Users, News, Events, Documents, Teams)         │
└─────────────────────────────────────────────────────────────┘
                  │
                  │ API Calls (optional)
                  │
┌─────────────────▼───────────────────────────────────────────┐
│          Microsoft Teams / Azure AD                         │
│      (Real-time sync, authentication)                       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 🚀 Step 1: Clone and Setup Backend

### 1.1 Add Backend to Your Project

\`\`\`bash
cd share-point-like-portal

# Create backend directory
mkdir backend
cd backend

# Copy all backend files:
# - src/ folder with all TypeScript files
# - package.json
# - tsconfig.json
# - .env.example
# - scripts/ folder
# - SETUP.md
# - API_DOCS.md
# - README.md

# Install dependencies
npm install
\`\`\`

### 1.2 Initialize Database

**Option A: PostgreSQL Locally**
\`\`\`bash
# Create database
createdb sharepoint_portal

# Test connection
psql sharepoint_portal -c "SELECT 1;"
\`\`\`

**Option B: Docker (Recommended)**
\`\`\`bash
docker run --name postgres-sharepoint \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sharepoint_portal \
  -p 5432:5432 \
  -d postgres:16

# Wait for container to start (15-20 seconds)
sleep 20

# Verify
docker exec postgres-sharepoint pg_isready
\`\`\`

### 1.3 Configure Environment

\`\`\`bash
# Copy example environment
cp .env.example .env

# Edit .env
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
JWT_SECRET=dev-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sharepoint_portal
CORS_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000
API_URL=http://localhost:5000
EOF
\`\`\`

### 1.4 Start Backend Server

\`\`\`bash
# In backend directory
npm run dev

# Expected output:
# [SERVER] Initializing database...
# [DB] Database tables initialized successfully
# [SERVER] Server running on http://localhost:5000
# [SERVER] WebSocket available at ws://localhost:5000
\`\`\`

✅ Backend is now running!

---

## 🔗 Step 2: Connect Frontend to Backend

### 2.1 Update Frontend Environment

In your frontend project root, create/update `.env.local`:

\`\`\`bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### 2.2 Add API Client Library

Copy the `app/lib/api.ts` and `app/hooks/use-api.ts` files into your frontend project.

### 2.3 Update Frontend Layout

Update `app/layout.tsx` to initialize authentication:

\`\`\`typescript
// app/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [router]);

  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}
\`\`\`

### 2.4 Create Login Page

Create `app/login/page.tsx`:

\`\`\`typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <div className="bg-red-100 text-red-800 p-2 rounded">{error}</div>}
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
}
\`\`\`

### 2.5 Create Dashboard Page

Create `app/dashboard/page.tsx` to display data from backend:

\`\`\`typescript
'use client';

import { useEffect, useState } from 'react';
import { newsAPI, eventsAPI, announcementsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, eventsData, announcementsData] = await Promise.all([
          newsAPI.getAll(5, 0),
          eventsAPI.getAll(5, 0),
          announcementsAPI.getAll(5, 0),
        ]);

        setNews(newsData.items);
        setEvents(eventsData.items);
        setAnnouncements(announcementsData.items);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* News Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Latest News</h2>
        <div className="grid gap-4">
          {news.map((item: any) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>{item.content.slice(0, 100)}...</CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Events Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        <div className="grid gap-4">
          {events.map((item: any) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{new Date(item.start_time).toLocaleString()}</p>
                <p>{item.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Announcements Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Announcements</h2>
        <div className="grid gap-4">
          {announcements.map((item: any) => (
            <Card key={item.id} className={item.is_urgent ? 'border-red-500' : ''}>
              <CardHeader>
                <CardTitle className={item.is_urgent ? 'text-red-600' : ''}>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>{item.content}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
\`\`\`

---

## 🔄 Step 3: Setup Real-time Updates

### 3.1 Create WebSocket Hook

Create `app/hooks/use-realtime.ts`:

\`\`\`typescript
'use client';

import { useEffect, useCallback, useRef } from 'react';

export function useRealtime(token: string, onUpdate: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:5000?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WS] Connected');
      // Subscribe to updates
      ws.send(JSON.stringify({ type: 'subscribe', data: { channel: 'portal' } }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'update') {
        onUpdate(message);
      }
    };

    ws.onerror = (error) => console.error('[WS] Error:', error);
    ws.onclose = () => console.log('[WS] Disconnected');

    wsRef.current = ws;

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [token, onUpdate]);

  return wsRef.current;
}
\`\`\`

### 3.2 Use in Dashboard

\`\`\`typescript
'use client';

import { useRealtime } from '@/hooks/use-realtime';

export default function DashboardPage() {

  useRealtime(authToken, (update) => {
    if (update.resource === 'news') {
      // Refresh news list
      loadNews();
    } else if (update.resource === 'events') {
      // Refresh events list
      loadEvents();
    }
  });

  // ... rest of component ...
}
\`\`\`

---

## 🔐 Step 4: Setup Azure AD (Optional)

### 4.1 Create Azure App Registration

1. Go to https://portal.azure.com
2. Azure AD → App Registrations → New Registration
3. Name: "SharePoint Portal"
4. Redirect URI: `http://localhost:3000/auth/callback`
5. Click Register
6. Copy Application (client) ID and Tenant ID

### 4.2 Configure Frontend

Create `.env.local`:

\`\`\`
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
\`\`\`

### 4.3 Add Azure Login

\`\`\`typescript
'use client';

import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function AzureLoginButton() {
  const router = useRouter();

  const handleAzureLogin = async () => {
    try {
      // In production, use @azure/msal-browser for proper OAuth flow
      // For now, redirect to Azure login flow
      const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
      const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
      
      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${window.location.origin}/auth/callback&` +
        `response_type=code&` +
        `scope=openid profile email`;

      window.location.href = authUrl;
    } catch (error) {
      console.error('Azure login failed:', error);
    }
  };

  return (
    <Button onClick={handleAzureLogin} variant="outline">
      Sign in with Microsoft
    </Button>
  );
}
\`\`\`

---

## 📊 Step 5: Integrate Portal Features

### 5.1 News Page

Create `app/news/page.tsx`:

\`\`\`typescript
'use client';

import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsAPI.getAll(20, 0).then(setNews).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">News</h1>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-4">
          {news.items?.map((item: any) => (
            <div key={item.id} className="p-4 border rounded-lg">
              <h2 className="text-xl font-bold">{item.title}</h2>
              <p>{item.content}</p>
              <small className="text-gray-500">{item.author_name}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
\`\`\`

### 5.2 Events Page

Create `app/events/page.tsx`:

\`\`\`typescript
'use client';

import { useEffect, useState } from 'react';
import { eventsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventsAPI.getAll(20, 0).then((data) => setEvents(data.items));
  }, []);

  const handleRsvp = async (eventId: string) => {
    await eventsAPI.rsvp(eventId);
    alert('RSVP successful!');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <div className="space-y-4">
        {events.map((event: any) => (
          <div key={event.id} className="p-4 border rounded-lg">
            <h2 className="text-xl font-bold">{event.title}</h2>
            <p>{new Date(event.start_time).toLocaleString()}</p>
            <p>{event.location}</p>
            <Button onClick={() => handleRsvp(event.id)}>RSVP</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### 5.3 Documents Page

Create `app/documents/page.tsx`:

\`\`\`typescript
'use client';

import { useEffect, useState } from 'react';
import { documentsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    documentsAPI.getAll(20, 0).then((data) => setDocuments(data.items));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    try {
      await documentsAPI.upload(file);
      setFile(null);
      // Refresh list
      const data = await documentsAPI.getAll(20, 0);
      setDocuments(data.items);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Documents</h1>
      
      <div className="mb-6">
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button onClick={handleUpload} disabled={!file}>Upload</Button>
      </div>

      <div className="space-y-2">
        {documents.map((doc: any) => (
          <div key={doc.id} className="p-4 border rounded-lg flex justify-between">
            <div>
              <p className="font-bold">{doc.file_name}</p>
              <small>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</small>
            </div>
            <a href={`/api/documents/${doc.id}/download`} className="text-blue-600">Download</a>
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

---

## 🌐 Step 6: Deploy to Production

### 6.1 Deploy Backend to Render

1. Push code to GitHub
2. Go to https://render.com
3. New → Web Service
4. Connect GitHub repository
5. Configure:
   - Build: `npm install && npm run build`
   - Start: `npm start`
6. Add environment variables
7. Deploy

### 6.2 Deploy Frontend to Vercel

1. Push to GitHub
2. Go to https://vercel.com
3. Import project
4. Set env variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api`
5. Deploy

### 6.3 Production Checklist

\`\`\`
[ ] JWT_SECRET changed to strong random string
[ ] DATABASE_URL uses production PostgreSQL
[ ] CORS_ORIGIN updated to production URLs
[ ] SSL/HTTPS enabled
[ ] Email configuration set up (optional)
[ ] Azure AD credentials configured
[ ] Database backups scheduled
[ ] Monitoring/logging enabled
[ ] API rate limiting configured
\`\`\`

---

## 🧪 Testing

### Test Backend

\`\`\`bash
cd backend

# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "name":"Test User",
    "password":"test123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"test123"
  }'

# Get token from response, then:

# Get news
curl http://localhost:5000/api/news \
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

### Test Frontend

1. Open http://localhost:3000
2. You should be redirected to login
3. Create account or login
4. Should redirect to dashboard
5. Click through pages to test integrations

---

## 🆘 Troubleshooting

### Backend won't start

\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:5432
\`\`\`

**Solution**: Check PostgreSQL is running
\`\`\`bash
# Check PostgreSQL
pg_isready

# Or if using Docker
docker ps | grep postgres
\`\`\`

### CORS Error

\`\`\`
Access to XMLHttpRequest blocked by CORS
\`\`\`

**Solution**: Update CORS in backend/.env
\`\`\`
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
\`\`\`

### WebSocket Connection Failed

**Solution**: Check WebSocket URL format
\`\`\`typescript
// ❌ Wrong
const ws = new WebSocket('http://localhost:5000');

// ✅ Correct
const ws = new WebSocket('ws://localhost:5000?token=YOUR_TOKEN');
\`\`\`

### Database Connection Issues

**Solution**: Verify connection string
\`\`\`bash
# Test with psql
psql postgresql://user:pass@localhost:5432/sharepoint_portal

# Or check Docker
docker exec postgres-sharepoint psql -U postgres -d sharepoint_portal -c "SELECT 1;"
\`\`\`

---

## 📚 Next Steps

1. **Customize UI**: Modify components to match your brand
2. **Add Features**: Create additional pages/components
3. **Setup Teams Integration**: Configure Azure AD for real Teams sync
4. **Setup Email**: Configure SMTP for notifications
5. **Add Monitoring**: Setup logging and error tracking
6. **Performance**: Optimize queries and add caching

---

## 📞 Support

For issues:
1. Check logs: `npm run dev` in backend
2. Review [SETUP.md](./backend/SETUP.md)
3. Check [API_DOCS.md](./backend/API_DOCS.md)
4. Create GitHub issue with details

---

**Your full-stack SharePoint portal is ready! 🎉**
