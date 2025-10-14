# Deployment Guide - MovieZone App

এই গাইডটি আপনাকে Netlify (frontend) এবং Render (backend) এ deploy করতে সাহায্য করবে।

## 📋 সারসংক্ষেপ

- **Frontend (Client)**: Netlify এ deploy করুন
- **Backend (Server)**: Render এ deploy করুন
- **Database**: Supabase PostgreSQL (already configured)

---

## 🚀 Netlify Deployment (Frontend)

### Step 1: Build করুন (Local Test)
```bash
npm install
npm run build:client
```

### Step 2: GitHub এ Push করুন
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Netlify তে Environment Variables সেট করুন

Netlify Dashboard → Site Settings → Environment Variables এ যান এবং এই variables গুলো add করুন:

```
VITE_BACKEND_URL=https://full-links.onrender.com
VITE_SUPABASE_URL=https://ztorzqnvzxbptmdmaqyi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b3J6cW52enhicHRtZG1hcXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjYxMjYsImV4cCI6MjA3MDUwMjEyNn0.W3vfOKZWwqRNZdCdcQZzHhsQOwvMxCzXJu3VZ7pHT-o
```

### Step 4: Build Settings Check করুন

Netlify Dashboard → Site Settings → Build & Deploy তে:

- **Build command**: `npm install && npm run build:client`
- **Publish directory**: `client/dist`
- **Node version**: 20 (set in netlify.toml)

---

## 🔧 Render Deployment (Backend)

### Step 1: Build করুন (Local Test)
```bash
npm install
npm run build:server
```

### Step 2: Render তে Environment Variables সেট করুন

Render Dashboard → Environment তে যান এবং এই variables গুলো add করুন:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:Sudipb184495@db.ztorzqnvzxbptmdmaqyi.supabase.co:5432/postgres
SUPABASE_URL=https://ztorzqnvzxbptmdmaqyi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b3J6cW52enhicHRtZG1hcXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MjYxMjYsImV4cCI6MjA3MDUwMjEyNn0.W3vfOKZWwqRNZdCdcQZzHhsQOwvMxCzXJu3VZ7pHT-o
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0b3J6cW52enhicHRtZG1hcXlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkyNjEyNiwiZXhwIjoyMDcwNTAyMTI2fQ.hcYnrfc1A4qdHj2ERRqZ615hqmD0Med6xdPAb2s5Yb0
FRONTEND_URL=https://your-moviezone-frontend.netlify.app
ALLOWED_ORIGINS=https://your-moviezone-frontend.netlify.app
```

**গুরুত্বপূর্ণ**: `FRONTEND_URL` এবং `ALLOWED_ORIGINS` এ আপনার Netlify URL দিন!

### Step 3: Build Settings Check করুন

render.yaml ফাইলে already configured আছে:

- **Build Command**: `npm install && npm run build:server`
- **Start Command**: `node server/dist/index.js`

---

## 📁 Dist Folders এবং Git

### Important: Dist folders এখন git এ track হবে!

নতুন code update করার পর:

```bash
# Build করুন
npm run build

# Git এ add করুন (dist folders সহ)
git add .
git commit -m "Updated code with new builds"
git push origin main
```

`.gitignore` ফাইলে dist folders ignore করা নেই, তাই সেগুলো commit হবে।

---

## ✅ Build সমস্যার সমাধান

### Previous Issues (Fixed):
1. ✅ **"vite: not found"** → Fixed: `vite` এখন dependencies তে আছে
2. ✅ **"esbuild: not found"** → Fixed: `esbuild` এখন dependencies তে আছে

### যদি Build Fail করে:

#### Netlify এ:
1. Environment variables সঠিকভাবে set করেছেন কিনা check করুন
2. Build command: `npm install && npm run build:client`
3. Publish directory: `client/dist`

#### Render এ:
1. Environment variables সঠিকভাবে set করেছেন কিনা check করুন
2. Build command render.yaml এ আছে: `npm install && npm run build:server`

---

## 🔐 Security নোট

- ✅ `server/.env` file git এ ignore করা আছে (sensitive credentials আছে)
- ✅ `client/.env` শুধুমাত্র public VITE_ variables আছে (safe)
- ⚠️ Production এ সব secrets Dashboard থেকে set করুন, .env file থেকে নয়!

---

## 📞 সমস্যা হলে

1. Build logs check করুন Netlify/Render dashboard এ
2. Environment variables verify করুন
3. `npm run build:client` এবং `npm run build:server` locally test করুন

---

## 🎯 Quick Deployment Checklist

- [ ] Local build test করেছেন (`npm run build`)
- [ ] Git এ push করেছেন (dist folders সহ)
- [ ] Netlify তে environment variables set করেছেন
- [ ] Render তে environment variables set করেছেন
- [ ] FRONTEND_URL এবং BACKEND_URL update করেছেন
- [ ] Build logs check করেছেন
- [ ] Website test করেছেন

সব ঠিক থাকলে আপনার MovieZone app live হয়ে যাবে! 🎉
