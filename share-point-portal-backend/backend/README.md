# SharePoint-like Portal Backend

A full-featured Node.js + Express backend for a SharePoint-like collaboration portal with Microsoft Teams integration.

## Features

- ✅ **Authentication & Authorization**: JWT-based auth with Azure AD support
- ✅ **Real-time Updates**: WebSocket support for live notifications
- ✅ **Microsoft Teams Integration**: Sync channels, messages, and data
- ✅ **REST API**: Comprehensive endpoints for all portal features
- ✅ **Database**: PostgreSQL with proper schema and indexing
- ✅ **Security**: CORS, authentication middleware, rate limiting ready
- ✅ **Scalable**: Production-ready architecture
- ✅ **Mock Data**: Works without Teams integration for development

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
\`\`\`

Server will run on `http://localhost:5000`

## Project Structure

\`\`\`
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── database/
│   │   ├── connection.ts     # DB connection pool
│   │   └── init.ts           # Schema initialization
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication
│   ├── routes/
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── news.ts           # News CRUD
│   │   ├── events.ts         # Events management
│   │   ├── documents.ts      # Document uploads
│   │   ├── teams.ts          # Teams integration
│   │   ├── announcements.ts  # Announcements
│   │   └── users.ts          # User management
│   ├── services/
│   │   └── teamsService.ts   # Teams API integration
│   └── websocket/
│       └── server.ts         # WebSocket setup
├── scripts/
│   └── seed.ts               # Database seeding
├── package.json
├── tsconfig.json
├── .env.example
└── SETUP.md                  # Detailed setup guide
\`\`\`

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed endpoint documentation.

## Deployment

- **Render**: [Deployment Guide](./SETUP.md#deploy-to-render)
- **Railway**: [Deployment Guide](./SETUP.md#deploy-to-railway)
- **Vercel**: [Deployment Guide](./SETUP.md#deploy-to-vercel)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL URL | `postgresql://...` |
| `JWT_SECRET` | Secret key | `your-secret-key` |
| `AZURE_TENANT_ID` | Azure tenant | `your-tenant-id` |
| `AZURE_CLIENT_ID` | Azure app ID | `your-client-id` |
| `AZURE_CLIENT_SECRET` | Azure secret | `your-secret` |

## Testing

\`\`\`bash
# Test API endpoints
curl -X GET http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
\`\`\`

## Contributing

1. Create feature branch
2. Commit changes
3. Push to GitHub
4. Create Pull Request

## License

MIT License - feel free to use this for your projects!

## Support

Need help? Check [SETUP.md](./SETUP.md) for troubleshooting.
