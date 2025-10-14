# MovieZone Admin Panel

## Overview
MovieZone is a link shortening service for movie downloads, featuring an admin panel for link management and a redirect page for short URLs. It supports creating short links for single movies, quality-based movie links (e.g., 480p, 720p, 1080p), and quality episodes for series. The platform aims to provide a streamlined way to share movie content while enabling optional ad displays for revenue generation. It includes a Universal API for integration with external services like bots and websites.

## User Preferences
- Use TypeScript for all new code
- Use server/.env file for Supabase integration (create from .env.example template)
- Follow modern React patterns with hooks and functional components
- Use wouter for routing instead of React Router
- Admin login: Server-side verification without password hashing
- Security: Always use your own Supabase credentials, never commit secrets

## System Architecture
The application is built with a React (TypeScript) frontend, an Express.js (TypeScript) backend, and Supabase for database persistence. Styling is managed with Tailwind CSS and shadcn/ui components.

**UI/UX Decisions:**
- The redirect page features a 10-second countdown timer before showing content.
- Admin panel includes a 2x2 grid for statistics (Total Links, Today's Links, Total Views, Today's Views) and a "Recent Links" section.
- Admin panel supports separate tabs for managing Single Links, Quality Links, and Quality Episodes.
- Dynamic quality badges are displayed for quality links.

**Technical Implementations:**
- **Link Types:** Supports single movie links, quality movie links (multiple resolutions), and quality episodes (series with multiple resolutions per episode).
- **Shortening Service:** Generates unique short IDs for links (`/m/` for movies, `/e/` for episodes).
- **View Tracking:** Implements IP-based duplicate protection for views, counting only one view per IP per link within a 5-minute window.
- **Timer Skip System:** Users who complete the 10-second ad timer are not shown it again for 5 minutes on the same link from the same IP address.
- **Admin Panel:** Features include link generation, editing, deletion, API token management, and dynamic admin credential updates via Supabase.
- **API:** Provides a Universal API with secure Bearer token authentication for creating short links from external services. API-created links always have ads enabled.
- **Deployment:** Configured for separate client (Vite) and server (Esbuild) builds, supporting independent hosting (e.g., Netlify for client, Render for server). CORS is configurable via environment variables.

**System Design Choices:**
- **Database Storage:** All application data, including movie links, API tokens, and admin credentials, is stored in Supabase. Memory-based storage has been completely removed.
- **Security:** Admin login credentials are managed dynamically through a Supabase table (`admin_settings`) and verified server-side. API tokens are managed with CRUD operations and status toggles. Sensitive data is stored in environment variables.
- **Data Handling:** Supabase REST API client is used for database interactions. Field names handle both camelCase and snake_case formats.
- **Routing:** Wouter is used for frontend routing.

## External Dependencies
- **Supabase:** Used as the primary database for all persistent data storage, including `movie_links`, `quality_links`, `quality_episodes`, `api_tokens`, `admin_settings`, and `ad_view_sessions` tables.
- **Express.js:** Backend framework.
- **React:** Frontend library.
- **Wouter:** Frontend router.
- **TanStack Query:** For state management in the frontend.
- **Tailwind CSS:** For styling.
- **shadcn/ui:** UI component library.

## Deployment Configuration (Updated: Oct 14, 2025)

**Environment Variables:**
- Client (.env): Uses `VITE_` prefix for all variables (VITE_API_URL for backend connection)
- Server (.env): Contains DATABASE_URL, SUPABASE credentials, FRONTEND_URL, ALLOWED_ORIGINS, and NODE_ENV
- Both .env files are in .gitignore for security
- Use .env.example files as templates

**Build Configuration:**
- `vite` and `esbuild` moved to dependencies (not devDependencies) for production builds
- Client build: `npm run build:client` → creates `client/dist/`
- Server build: `npm run build:server` → creates `server/dist/`
- Dist folders are committed to git for deployment

**Deployment Setup:**
- **Netlify (Frontend)**: 
  - Build command: `npm install && npm run build:client`
  - Publish directory: `client/dist`
  - Node version: 20
  - Environment variable: VITE_API_URL (Render backend URL)
- **Render (Backend)**:
  - Build command: `npm install && npm run build:server` 
  - Start command: `node server/dist/index.js`
  - Health check: `/api/health` endpoint
  - Environment variables: NODE_ENV, DATABASE_URL, SUPABASE credentials, ALLOWED_ORIGINS (Netlify URL)
  
**Recent Fixes (Oct 14, 2025):**
- ✅ Server now uses `process.env.PORT` for Render compatibility (auto-assigned port)
- ✅ Added `/api/health` endpoint for Render health checks
- ✅ CORS configured with ALLOWED_ORIGINS for cross-platform connection
- ✅ Documentation updated with detailed environment variable setup

**Security Notes:**
- Never commit actual credentials to git
- Set environment variables via Netlify/Render dashboards
- Rotate Supabase keys if accidentally exposed
- See SECURITY_WARNING.md and DEPLOYMENT.md for details