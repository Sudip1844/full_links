# Netlify Deployment Guide for MovieZone Client (Static HTML Version)

## ক্লায়েন্ট Netlify তে Deploy করার স্টেপ

**নোট: MovieZone client এখন React থেকে Static HTML এ convert করা হয়েছে better performance এবং simplified deployment এর জন্য।**

### 1. Netlify Account এবং Setup
- Netlify.com এ একটি account তৈরি করুন
- GitHub repository connect করুন

### 2. Site Settings কনফিগার করুন (Static HTML)
- "New site from Git" ক্লিক করুন
- আপনার GitHub repository select করুন
- **Base directory**: `client`
- **Build command**: `echo 'Static HTML build - no build step required'`
- **Publish directory**: `client` (root of client folder)

### 3. Environment Variables Setup (Static HTML - Auto-configured)
Static HTML version এ কোনো build-time environment variables এর প্রয়োজন নেই। API calls হবে runtime এ JavaScript দিয়ে।

### 4. Build Settings (Static HTML)
- **Build tool**: None (Static HTML files)
- **Node.js**: Not required for deployment
- **Build process**: No compilation needed

### 5. netlify.toml File (Static HTML Version - Already Configured)
```toml
# Static HTML Build Configuration for MovieZone Admin Panel
[build]
  publish = "."
  command = "echo 'Static HTML build - no build step required'"

[build.environment]
  NODE_VERSION = "20"

# Short link routes to RedirectPage for countdown/ads UI
[[redirects]]
  from = "/m/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/e/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/z/*"
  to = "/index.html"
  status = 200

# API proxy to backend server  
[[redirects]]
  from = "/api/*"
  to = "https://full-links.onrender.com/api/:splat"
  status = 200

# Catch-all for SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 6. Deploy করার পর
- আপনার Netlify app URL copy করুন (e.g., https://moviezone-client.netlify.app)
- এই URL টি server এর CLIENT_URL environment variable এ set করুন

### 7. Cross-Platform Connection
#### Server (Render) এ যা করতে হবে:
```
CLIENT_URL=https://আপনার-netlify-app.netlify.app
```

#### Client (Netlify) এ যা করতে হবে:
```
VITE_API_URL=https://আপনার-render-app.onrender.com
```

### 8. Test করুন
- Client app এ যান
- Admin panel access করার চেষ্টা করুন
- API calls properly কাজ করছে কিনা check করুন

### 9. Important Notes
- SPA (Single Page Application) routing handled হয়েছে
- CORS properly configured আছে
- Environment variables production এর জন্য optimized
- Build process automatic এবং fast