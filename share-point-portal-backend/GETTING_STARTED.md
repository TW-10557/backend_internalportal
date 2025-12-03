# Getting Started - SharePoint Portal Full Stack

## 🎯 What You Have

A complete, production-ready full-stack application with:
- **Frontend**: Next.js 16 with your existing UI
- **Backend**: Express.js REST API with 27+ endpoints
- **Database**: PostgreSQL with optimized schema
- **Real-time**: WebSocket support for live updates
- **Integration**: Microsoft Teams & Azure AD ready
- **Documentation**: Complete setup and API guides

---

## ⚡ Quick Start (10 minutes)

### Step 1: Setup Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env

# Edit .env - set DATABASE_URL
nano .env
\`\`\`

### Step 2: Start PostgreSQL

\`\`\`bash
# Option A: Docker (Recommended)
docker run --name postgres-sharepoint \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sharepoint_portal \
  -p 5432:5432 -d postgres:16

# Option B: Local PostgreSQL
createdb sharepoint_portal
\`\`\`

### Step 3: Start Backend

\`\`\`bash
npm run dev
# Should see: [SERVER] Server running on http://localhost:5000
\`\`\`

### Step 4: Start Frontend

\`\`\`bash
cd ..
npm run dev
# Should see: ▲ Next.js 16.0.3
\`\`\`

### Step 5: Test

Open http://localhost:3000 → You should see login page

---

## 📋 What's Included

### Backend Files
\`\`\`
backend/
├── src/
│   ├── index.ts              ← Server entry point
│   ├── database/
│   │   ├── connection.ts     ← DB connection
│   │   └── init.ts           ← Schema setup
│   ├── routes/               ← API endpoints
│   ├── middleware/           ← Auth, errors
│   ├── services/             ← Teams integration
│   └── websocket/            ← Real-time updates
├── scripts/
│   ├── seed.ts               ← Sample data
│   └── migrate.ts            ← Migrations
├── package.json
├── tsconfig.json
├── .env.example
├── SETUP.md                  ← Detailed setup
├── API_DOCS.md               ← API reference
└── README.md
\`\`\`

### Frontend Integration Files
\`\`\`
app/
├── lib/api.ts                ← API client
├── hooks/
│   ├── use-api.ts            ← API hook
│   └── use-realtime.ts       ← WebSocket hook
├── login/page.tsx            ← Login page
├── dashboard/page.tsx        ← Dashboard
├── news/page.tsx             ← News page
├── events/page.tsx           ← Events page
└── documents/page.tsx        ← Documents page
\`\`\`

---

## 🔑 Key Features

### Authentication
- Email/password login
- Azure AD integration
- JWT tokens (24h expiry)
- User profiles & preferences

### Content Management
- News articles with categories
- Events with RSVP
- Document uploads & sharing
- Announcements with urgency levels

### Real-time Updates
- WebSocket connections
- Live notifications
- Automatic data sync
- Subscription channels

### Teams Integration
- Fetch Teams channels
- Read Teams messages
- Sync data automatically
- Mock data for development

### User Management
- Profile customization
- Theme preferences (light/dark)
- Timezone settings
- Notification preferences

---

## 📡 API Quick Reference

### Authentication
\`\`\`bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"User","password":"pass"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
\`\`\`

### Get Data (with token)
\`\`\`bash
TOKEN="your_jwt_token"

# Get news
curl http://localhost:5000/api/news \
  -H "Authorization: Bearer $TOKEN"

# Get events
curl http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN"

# Get announcements
curl http://localhost:5000/api/announcements \
  -H "Authorization: Bearer $TOKEN"
\`\`\`

### Create Data
\`\`\`bash
# Create news
curl -X POST http://localhost:5000/api/news \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"News Title",
    "content":"News content",
    "category":"Updates"
  }'

# Create event
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Meeting",
    "start_time":"2024-01-25T14:00:00Z",
    "end_time":"2024-01-25T15:00:00Z",
    "location":"Room A"
  }'
\`\`\`

---

## 🗄️ Database

### Tables Created Automatically
- `users` - User accounts
- `news` - News articles
- `events` - Company events
- `documents` - Uploaded files
- `announcements` - Important messages
- `teams_channels` - Teams integration
- `teams_messages` - Teams messages
- `portal_preferences` - User settings
- `activity_logs` - Audit trail

### Sample Data
\`\`\`bash
cd backend
npm run seed
\`\`\`

---

## 🔌 Frontend Integration

### Use API in Components

\`\`\`typescript
import { newsAPI, eventsAPI } from '@/lib/api';

export default function NewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    newsAPI.getAll(10, 0).then(data => setNews(data.items));
  }, []);

  return (
    <div>
      {news.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
\`\`\`

### Real-time Updates

\`\`\`typescript
import { useRealtime } from '@/hooks/use-realtime';

export default function Dashboard() {
  const token = localStorage.getItem('authToken');

  useRealtime(token, (update) => {
    if (update.resource === 'news') {
      // Refresh news
    }
  });

  return <div>Dashboard</div>;
}
\`\`\`

---

## 🚀 Deployment

### Deploy Backend to Render

1. Push to GitHub
2. Go to render.com
3. New Web Service
4. Connect GitHub repo
5. Build: `npm install && npm run build`
6. Start: `npm start`
7. Add environment variables
8. Deploy

### Deploy Frontend to Vercel

1. Push to GitHub
2. Go to vercel.com
3. Import project
4. Set `NEXT_PUBLIC_API_URL` to backend URL
5. Deploy

### Deploy Database

Use Render PostgreSQL or Railway PostgreSQL

---

## 🔐 Environment Variables

### Backend (.env)
\`\`\`env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sharepoint_portal
CORS_ORIGIN=http://localhost:3000
\`\`\`

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `backend/SETUP.md` | Detailed setup & deployment |
| `backend/API_DOCS.md` | Complete API reference |
| `FULL_STACK_INTEGRATION_GUIDE.md` | Step-by-step integration |
| `PROJECT_SUMMARY.md` | Architecture & overview |
| `backend/README.md` | Backend project info |

---

## ✅ Verification Checklist

- [ ] Backend starts: `npm run dev` in backend/
- [ ] Frontend starts: `npm run dev` in root
- [ ] PostgreSQL running: `pg_isready`
- [ ] Health check: `curl http://localhost:5000/api/health`
- [ ] Can register: POST to `/api/auth/register`
- [ ] Can login: POST to `/api/auth/login`
- [ ] Can get news: GET `/api/news` with token
- [ ] Frontend loads: http://localhost:3000
- [ ] Can login in UI: Enter credentials
- [ ] Dashboard shows data: News, events, etc.

---

## 🆘 Troubleshooting

### Backend won't start
\`\`\`bash
# Check PostgreSQL
pg_isready

# Check port 5000 is free
lsof -i :5000

# Check .env file exists
cat backend/.env
\`\`\`

### Database connection error
\`\`\`bash
# Verify connection string
psql $DATABASE_URL

# Or with Docker
docker exec postgres-sharepoint psql -U postgres -d sharepoint_portal -c "SELECT 1;"
\`\`\`

### Frontend can't connect to backend
\`\`\`bash
# Check CORS_ORIGIN in backend/.env
# Should include http://localhost:3000

# Check NEXT_PUBLIC_API_URL in frontend/.env.local
# Should be http://localhost:5000/api
\`\`\`

### WebSocket connection fails
\`\`\`bash
# Check token is included in URL
# ws://localhost:5000?token=YOUR_TOKEN

# Check backend is running
curl http://localhost:5000/api/health
\`\`\`

---

## 📞 Need Help?

1. **Check Documentation**
   - backend/SETUP.md
   - backend/API_DOCS.md
   - FULL_STACK_INTEGRATION_GUIDE.md

2. **Check Logs**
   - Backend: `npm run dev` output
   - Frontend: Browser console
   - Database: PostgreSQL logs

3. **Test Endpoints**
   - Use cURL or Postman
   - Check API_DOCS.md for examples

4. **Verify Setup**
   - All env variables set
   - PostgreSQL running
   - Ports available (3000, 5000, 5432)

---

## 🎉 You're Ready!

Your full-stack SharePoint portal is ready to use. Start with:

\`\`\`bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev

# Terminal 3 (if needed)
docker run --name postgres-sharepoint \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sharepoint_portal \
  -p 5432:5432 -d postgres:16
\`\`\`

Then visit: **http://localhost:3000**

---

**Happy building! 🚀**
