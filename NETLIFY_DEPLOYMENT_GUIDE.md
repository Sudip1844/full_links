# Netlify Deployment Guide for MovieZone Client

## ক্লায়েন্ট Netlify তে Deploy করার স্টেপ

### 1. Netlify Account এবং Setup
- Netlify.com এ একটি account তৈরি করুন
- GitHub repository connect করুন

### 2. Site Settings কনফিগার করুন
- "New site from Git" ক্লিক করুন
- আপনার GitHub repository select করুন
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `client/dist`

### 3. Environment Variables Setup (Netlify Dashboard এ)
নিচের environment variables গুলো Netlify এর dashboard এ add করুন:

```
VITE_API_URL=https://আপনার-render-app.onrender.com
NODE_ENV=production
```

### 4. Build Settings
Netlify automatically detect করবে:
- Node.js version: 20
- NPM version: 10
- Build tool: Vite

### 5. netlify.toml File (Already Configured)
```toml
[build]
  base = "."
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

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