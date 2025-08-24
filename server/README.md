# MovieZone Server

This is the backend server for MovieZone application, designed to be deployed on Render independently from the client.

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=your_postgresql_connection_string

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_ID=your_admin_id
ADMIN_PASSWORD=your_admin_password

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
DEFAULT_API_TOKEN=your_default_api_token

# Client URL (for CORS)
CLIENT_URL=https://your-replit-client-url.replit.app
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Database Migration

```bash
npm run db:push
```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm start`
5. Add all environment variables in Render dashboard
6. Deploy

## API Endpoints

The server provides REST API endpoints for:

- Movie Links Management
- Quality Movie Links
- API Token Management
- Admin Settings
- Quality Episodes
- Quality Zips

## CORS Configuration

The server is configured to accept requests from the client URL specified in the `CLIENT_URL` environment variable. Make sure to set this to your Replit client application URL.