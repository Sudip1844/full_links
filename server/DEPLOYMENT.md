# MovieZone Server - Render Deployment Guide

## Overview
Deploy the MovieZone backend API to Render as a Web Service.

## Prerequisites
- Render account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project with database setup

## Environment Variables

Add these in Render Dashboard → Environment → Environment Variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-id.supabase.co:5432/postgres

# Client URL (your Netlify deployment)
CLIENT_URL=https://your-app.netlify.app

# Node Environment
NODE_ENV=production
```

## Build Settings

### Web Service Configuration
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Root Directory**: `server`

## Deployment Steps

### Method 1: Through Render Dashboard

1. **Login to Render**: Go to https://dashboard.render.com
2. **New Web Service**: Click "New" → "Web Service"
3. **Connect Git Repository**: Choose your MovieZone repository
4. **Configure Service**:
   - **Name**: `moviezone-server` (or your choice)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: Free tier works

5. **Add Environment Variables**:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://...
   CLIENT_URL=https://your-app.netlify.app
   NODE_ENV=production
   ```

6. **Deploy**: Click "Create Web Service"

### Method 2: Using render.yaml (Infrastructure as Code)

Create `render.yaml` in server directory:

```yaml
services:
  - type: web
    name: moviezone-server
    runtime: node
    rootDir: server
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: DATABASE_URL
        sync: false
      - key: CLIENT_URL
        sync: false
```

Then deploy via Render dashboard by selecting "Blueprint" option.

## Getting Supabase Credentials

### SUPABASE_URL
1. Go to your Supabase project
2. Settings → API
3. Copy "Project URL"

### SUPABASE_SERVICE_ROLE_KEY
1. Go to your Supabase project
2. Settings → API
3. Copy "service_role" key (NOT anon key)
4. ⚠️ Keep this secret!

### DATABASE_URL
1. Go to your Supabase project
2. Settings → Database
3. Under "Connection string" → "URI"
4. Copy and replace `[YOUR-PASSWORD]` with your database password

## Post-Deployment Steps

### 1. Copy Server URL
After deployment, copy your Render URL:
```
https://moviezone-server.onrender.com
```

### 2. Update Client Environment Variable
Update Netlify environment variable:
```env
VITE_API_URL=https://moviezone-server.onrender.com
```

### 3. Verify CORS Configuration
The server automatically allows your `CLIENT_URL` for CORS. Verify it's set correctly.

### 4. Database Setup
Ensure Supabase tables are created using the SQL schema provided in project root.

## Health Check (Optional)

Add a health check endpoint in your server for Render monitoring:

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

Configure in Render:
- **Health Check Path**: `/health`

## Continuous Deployment

Render automatically deploys when you push to your main branch.

### Manual Deploy
- Go to Render dashboard
- Click "Manual Deploy" → "Deploy latest commit"

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies are in `server/package.json`
- Ensure Node version compatibility

### Server Won't Start
- Check if `PORT` environment variable is set (Render sets this automatically)
- Verify start command: `npm run start`
- Check server logs for errors

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check Supabase project is active
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)

### CORS Errors
- Verify `CLIENT_URL` matches your Netlify URL exactly
- Include protocol: `https://your-app.netlify.app`
- Check server logs for CORS-related errors

## Performance & Scaling

### Free Tier Limitations
- Spins down after 15 minutes of inactivity
- First request may be slow (cold start ~30 seconds)
- 750 hours/month free compute

### Upgrade Options
For production use:
- **Starter Plan ($7/month)**: No spin down, better performance
- **Standard Plan**: More resources, auto-scaling

### Optimize Cold Starts
- Keep services warm with uptime monitoring (e.g., UptimeRobot)
- Upgrade to paid plan to prevent spin down

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory usage
- **Alerts**: Set up email notifications for service issues

## Security Best Practices

1. **Never commit** `.env` files
2. **Use Secrets** for all sensitive data
3. **Rotate Keys** periodically
4. **HTTPS Only** (Render provides free SSL)
5. **CORS** properly configured to only allow your client domain

## Cost Estimate

**Render Free Tier Includes:**
- 750 hours/month
- Automatic HTTPS
- Custom domains
- Continuous deployment

**Paid Tier ($7/month):**
- Always-on service (no spin down)
- Better performance
- Recommended for production

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Supabase Documentation](https://supabase.com/docs)
