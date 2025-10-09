# MovieZone - Separate Deployment Guide

## 📋 Overview

This project is structured for **separate deployment**:
- **Frontend (Client)**: Deploy to Netlify
- **Backend (Server)**: Deploy to Render

## 🗂️ Project Structure

```
moviezone/
├── client/              # React frontend
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── DEPLOYMENT.md    # Detailed Netlify guide
│
├── server/              # Express backend
│   ├── shared/
│   ├── migrations/
│   ├── .env.example
│   ├── package.json
│   └── DEPLOYMENT.md    # Detailed Render guide
│
└── DEPLOYMENT_SUMMARY.md  # This file
```

## 🚀 Quick Start Deployment

### Step 1: Setup Supabase Database

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `SUPABASE_SQL_SCHEMA.sql` in SQL Editor
3. Get your credentials:
   - Project URL
   - Service Role Key
   - Database URL (Connection String)

### Step 2: Deploy Backend to Render

1. **Go to Render**: https://dashboard.render.com
2. **Create New Web Service**: Connect your Git repository
3. **Configure**:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`

4. **Add Environment Variables**:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-id.supabase.co:5432/postgres
   NODE_ENV=production
   CLIENT_URL=          # Leave empty for now, update after deploying client
   ```

5. **Deploy** and copy the server URL (e.g., `https://moviezone-server.onrender.com`)

### Step 3: Deploy Frontend to Netlify

1. **Go to Netlify**: https://app.netlify.com
2. **Add New Site**: Import from Git
3. **Configure**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

4. **Add Environment Variable**:
   ```env
   VITE_API_URL=https://moviezone-server.onrender.com
   ```
   (Use your actual Render URL from Step 2)

5. **Deploy** and copy the Netlify URL (e.g., `https://moviezone.netlify.app`)

### Step 4: Update Backend CORS

1. Go back to **Render Dashboard**
2. Update environment variable:
   ```env
   CLIENT_URL=https://moviezone.netlify.app
   ```
   (Use your actual Netlify URL from Step 3)

3. **Redeploy** the server for changes to take effect

## ✅ Verification Checklist

- [ ] Supabase project created and SQL schema imported
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Netlify
- [ ] Backend `CLIENT_URL` updated with Netlify URL
- [ ] Frontend `VITE_API_URL` updated with Render URL
- [ ] Admin login works
- [ ] Link creation works
- [ ] Redirect links work (`/m/`, `/e/`, `/z/`)

## 🌍 Environment Variables Summary

### Client (Netlify)
```env
VITE_API_URL=https://your-backend.onrender.com
```

### Server (Render)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-id.supabase.co:5432/postgres
CLIENT_URL=https://your-app.netlify.app
NODE_ENV=production
```

## 📝 Important Notes

### CORS Configuration
The server is configured to accept requests only from the `CLIENT_URL`. Make sure both services have the correct URLs configured.

### Redirect Links
Short links (`/m/abc123`, `/e/xyz789`, `/z/def456`) work as follows:
1. User visits: `https://your-backend.onrender.com/m/abc123`
2. Server redirects to: `https://your-app.netlify.app/redirect?link=...`
3. Client shows the redirect page with timer and download link

### Cold Starts (Render Free Tier)
- Free tier spins down after 15 minutes of inactivity
- First request may take ~30 seconds (cold start)
- Consider upgrading to Starter plan ($7/month) for always-on service

### Database Management
- All data is stored in Supabase
- Manage admin credentials directly in Supabase dashboard
- API tokens are managed through the admin panel

## 🔧 Local Development

### Prerequisites
- Node.js 18+ installed
- Supabase project setup

### Setup

1. **Clone repository**:
   ```bash
   git clone <your-repo-url>
   cd moviezone
   ```

2. **Setup Client**:
   ```bash
   cd client
   npm install
   # Create .env from .env.example (leave VITE_API_URL empty for local dev)
   npm run dev
   ```

3. **Setup Server**:
   ```bash
   cd server
   npm install
   # Create .env from .env.example
   # Add your Supabase credentials
   NODE_ENV=development npm run dev
   ```

4. **Access**:
   - Frontend: Served by backend at http://localhost:5000
   - Backend API: http://localhost:5000/api

## 📚 Detailed Guides

- **Frontend Deployment**: See `client/DEPLOYMENT.md`
- **Backend Deployment**: See `server/DEPLOYMENT.md`
- **API Documentation**: See `API_DOCUMENTATION.md`

## 🐛 Troubleshooting

### CORS Errors
- Verify `CLIENT_URL` on server matches your Netlify URL exactly
- Include the protocol: `https://your-app.netlify.app`

### Build Failures
- Check build logs in Netlify/Render dashboards
- Verify all dependencies are listed in respective `package.json`
- Ensure environment variables are set correctly

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check Supabase project is active
- Ensure you're using service_role key, not anon key

## 💰 Cost Breakdown

### Free Tier (Both Platforms)
- **Netlify**: 100GB bandwidth/month (Free)
- **Render**: 750 hours/month (Free)
- **Supabase**: 500MB database, 1GB file storage (Free)

**Total Monthly Cost**: $0 (Free tier sufficient for testing/small projects)

### Production Tier
- **Netlify**: $19/month (Pro tier, optional)
- **Render**: $7/month (Starter tier, recommended)
- **Supabase**: $25/month (Pro tier, optional)

**Recommended Production Cost**: ~$7-32/month depending on needs

## 🔐 Security Checklist

- [ ] Never commit `.env` files
- [ ] Rotate Supabase keys periodically
- [ ] Use strong admin passwords
- [ ] Keep CORS restricted to your client domain
- [ ] Enable HTTPS only (automatic on both platforms)

## 📞 Support

- **Netlify**: https://docs.netlify.com
- **Render**: https://render.com/docs
- **Supabase**: https://supabase.com/docs

---

**Happy Deploying! 🚀**
