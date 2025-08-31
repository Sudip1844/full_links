# Render Deployment Guide for MovieZone Server

## সার্ভার Render এ Deploy করার স্টেপ

### 1. Render Account এবং Setup
- Render.com এ একটি account তৈরি করুন
- GitHub repository connect করুন

### 2. Web Service তৈরি করুন
- "New Web Service" ক্লিক করুন
- আপনার GitHub repository select করুন
- **Root Directory**: `server` (অবশ্যই set করুন)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Environment Variables Setup (Render Dashboard এ)
নিচের environment variables গুলো Render এর dashboard এ add করুন:

```
NODE_ENV=production
DATABASE_URL=আপনার_supabase_database_url
SUPABASE_URL=আপনার_supabase_project_url  
SUPABASE_ANON_KEY=আপনার_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=আপনার_supabase_service_role_key
CLIENT_URL=https://আপনার-netlify-app.netlify.app
```

### 4. Important Notes
- Server folder এ সব dependency আছে
- TypeScript TSX দিয়ে directly run হবে, compile করার দরকার নেই
- Build process খুবই simple এবং fast
- Auto-deploy enabled থাকবে
- Health check endpoint: `/` (root)

### 5. Deploy করার পর
- আপনার Render app URL copy করুন (e.g., https://moviezone-server.onrender.com)
- এই URL টি client configuration এ use করবেন

### 6. Troubleshooting
- যদি deploy fail হয়, logs check করুন
- Make sure root directory "server" set করা আছে
- Environment variables সব correctly set করা আছে কিনা check করুন