# MovieZone Client - Netlify Deployment Guide

## Overview
Deploy the MovieZone frontend to Netlify with automatic builds and deployments.

## Prerequisites
- Netlify account (free tier works)
- Git repository (GitHub, GitLab, or Bitbucket)
- Your deployed backend URL (from Render)

## Environment Variables

Add these in Netlify Dashboard → Site Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

**Important**: Replace `your-backend-url.onrender.com` with your actual Render server URL.

## Build Settings

### Basic Build Settings
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `client/dist`

### Detailed Configuration

1. **Install Command** (Optional):
   ```bash
   npm install
   ```

2. **Build Command**:
   ```bash
   npm run build
   ```

3. **Publish Directory**:
   ```
   dist
   ```

## Deployment Steps

### Method 1: Through Netlify Dashboard

1. **Login to Netlify**: Go to https://app.netlify.com
2. **Add New Site**: Click "Add new site" → "Import an existing project"
3. **Connect Git Provider**: Choose GitHub/GitLab/Bitbucket
4. **Select Repository**: Choose your MovieZone repository
5. **Configure Build Settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
6. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com`
7. **Deploy**: Click "Deploy site"

### Method 2: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to client folder
cd client

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Or deploy manually
netlify deploy --prod
```

## Post-Deployment Configuration

### Update Server CORS Settings

After deployment, update your server's `CLIENT_URL` environment variable on Render with your Netlify URL:

```env
CLIENT_URL=https://your-app.netlify.app
```

### Custom Domain (Optional)

1. Go to Netlify Dashboard → Domain Settings
2. Add custom domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` on Render with your custom domain

## Continuous Deployment

Netlify automatically deploys when you push to your main branch.

### Branch Previews
- Enable branch deploys for preview environments
- Each branch gets its own preview URL

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure environment variables are set correctly

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check if server is deployed and running on Render
- Verify CORS is configured on server with your Netlify URL

### 404 on Page Refresh
Add a `_redirects` file in `public` folder:
```
/*    /index.html   200
```

## Performance Optimization

### Enable Asset Optimization
In Netlify Dashboard → Build & deploy → Post processing:
- ✅ Asset optimization
- ✅ Pretty URLs
- ✅ Bundle CSS
- ✅ Minify JS & CSS

### Enable CDN
Netlify automatically serves your app through their global CDN.

## Monitoring

- **Analytics**: Enable Netlify Analytics for visitor insights
- **Build Notifications**: Set up email/Slack notifications for build status
- **Deploy Logs**: Check deploy logs for issues

## Cost Estimate

**Netlify Free Tier Includes:**
- 100GB bandwidth/month
- Automatic HTTPS
- Continuous deployment
- Global CDN
- Custom domain support

Perfect for MovieZone client deployment!
