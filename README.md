# MovieZone Admin Panel

A secure movie link shortening service with Universal API integration for multiple platforms.

## 🚀 Features

- **Universal API** - Works with Telegram bots, Discord bots, websites, and any external service
- **Secure Authentication** - Token-based API authentication system
- **Admin Panel** - Complete link management interface
- **Redirect System** - 10-second countdown with ads integration
- **Database Management** - PostgreSQL with Supabase integration

## 📁 Project Structure

```
moviezone/
├── client/                    # Frontend React application
│   ├── src/                   # React components and pages
│   ├── .env.example          # Client environment template
│   ├── package.json          # Client dependencies
│   └── DEPLOYMENT.md         # Netlify deployment guide
│
├── server/                    # Backend Express.js API
│   ├── shared/               # Shared TypeScript schemas
│   ├── migrations/           # Database migrations
│   ├── .env.example          # Server environment template
│   ├── package.json          # Server dependencies
│   └── DEPLOYMENT.md         # Render deployment guide
│
└── DEPLOYMENT_SUMMARY.md      # Complete deployment guide
```

## 🔧 Setup Instructions

### Local Development (Replit/Local Machine)

1. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd moviezone
   ```

2. **Setup Server**:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Setup Client**:
   ```bash
   cd ../client
   npm install
   # For local dev, leave VITE_API_URL empty (uses same origin)
   ```

4. **Database Setup**: 
   - Create Supabase project
   - Run SQL schema from `SUPABASE_SQL_SCHEMA.sql`

5. **Start Development Server**:
   ```bash
   cd server
   NODE_ENV=development npm run dev
   # Server runs on port 5000, serves both API and client
   ```

### Production Deployment (Separate Hosting)

**🚀 Quick Deploy:**
1. **Backend → Render** (See `server/DEPLOYMENT.md`)
2. **Frontend → Netlify** (See `client/DEPLOYMENT.md`)
3. **Complete Guide** → `DEPLOYMENT_SUMMARY.md`

**Environment Variables:**
- **Client (Netlify)**: `VITE_API_URL=https://your-server.onrender.com`
- **Server (Render)**: 
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
  - `CLIENT_URL=https://your-app.netlify.app`
  - `NODE_ENV=production`

## 🔐 Security Features

- **Environment Protection** - Credentials via Replit Secrets or `server/.env` (never committed)
- **Server-side Auth** - Plain text admin verification (no client-side password exposure)  
- **Token Authentication** - Secure Bearer token system for API access
- **Database Security** - Supabase RLS policies enabled
- **Input Validation** - Zod schema validation throughout
- **Key Rotation** - Always use your own Supabase project and rotate keys if importing from public repo

## 📖 API Documentation

See `API_DOCUMENTATION.md` for complete integration examples.

## 🌐 Deployment

**Recommended Stack:**
- **Frontend**: Netlify (Free tier: 100GB bandwidth/month)
- **Backend**: Render (Free tier: 750 hours/month)  
- **Database**: Supabase (Free tier: 500MB database)

**Guides:**
- 📘 **Complete Guide**: `DEPLOYMENT_SUMMARY.md`
- 🎨 **Frontend (Netlify)**: `client/DEPLOYMENT.md`
- ⚙️ **Backend (Render)**: `server/DEPLOYMENT.md`

## ⚡ Universal API Usage

```bash
curl -X POST your-domain.com/api/create-short-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"movieName": "Movie Title", "originalLink": "https://download-link"}'
```

**Note:** API-created links always have ads enabled for revenue protection.