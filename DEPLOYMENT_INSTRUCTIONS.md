# Deployment Instructions

## Client Deployment (Netlify)

### Prerequisites
1. Create a Netlify account
2. Install Netlify CLI: `npm install -g netlify-cli`

### Steps
1. **Build the client**:
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Deploy to Netlify**:
   - Option A: Drag and drop the `client/dist` folder to Netlify dashboard
   - Option B: Use Netlify CLI:
     ```bash
     netlify deploy --prod --dir=dist
     ```

3. **Set Environment Variables in Netlify**:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-render-app.onrender.com`

## Server Deployment (Render)

### Prerequisites
1. Create a Render account
2. Connect your GitHub repository

### Steps
1. **Create a Web Service**:
   - Connect your repository
   - Set root directory to `server`
   - Use the existing `render.yaml` configuration

2. **Set Environment Variables in Render**:
   - `CLIENT_URL` = `https://your-netlify-app.netlify.app`
   - `DATABASE_URL` = Your Supabase database URL
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_ANON_KEY` = Your Supabase anon key
   - `NODE_ENV` = `production`

## Cross-Platform Connection

After both deployments:
1. Update `VITE_API_URL` in Netlify to point to your Render app URL
2. Update `CLIENT_URL` in Render to point to your Netlify app URL
3. Verify CORS settings allow communication between the two domains

## Environment Variables Summary

### Client (Netlify)
- `VITE_API_URL`: Your Render server URL
- `NODE_ENV`: `production`

### Server (Render)
- `CLIENT_URL`: Your Netlify client URL
- `DATABASE_URL`: Supabase database connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `NODE_ENV`: `production`
- `PORT`: Automatically set by Render