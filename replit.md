# MovieZone Admin Panel

## Overview
MovieZone is a movie link shortening service designed for administrators to generate short URLs for movie downloads, with an option to include advertisements. The application comprises an admin panel for managing links and a redirect page that processes these short URLs. The project aims to provide a robust, scalable, and user-friendly platform for content distributors to manage and monetize movie links. It supports various link types including single movies, quality-based movie links, and episode series, integrating a universal API for broad platform compatibility.

## User Preferences
- Use TypeScript for all new code
- Use server/.env file for Supabase integration (create from .env.example template)
- Follow modern React patterns with hooks and functional components
- Use wouter for routing instead of React Router
- Admin login: Server-side verification without password hashing
- Security: Always use your own Supabase credentials, never commit secrets

## System Architecture
The application is structured into independent client and server components to allow for separate deployment and scaling.

### Frontend
- **Technology**: React with TypeScript, Wouter for routing, TanStack Query for state management.
- **Styling**: Tailwind CSS with shadcn/ui components.
- **UI/UX Decisions**: Features an admin panel with a 2x2 stats grid (Total Links, Today's Links, Total Views, Today's Views), a "Recent Links" section, and tabbed interfaces for managing Single Links, Quality Links, and Episodes. The redirect page includes a 10-second countdown timer, movie name display, and a "Continue" section that appears after timer completion. IP-based timer skip is implemented for improved user experience, preventing repeated ad views within a 5-minute window.

### Backend
- **Technology**: Express.js server with TypeScript.
- **Core Features**:
    - **Link Management**: Creation, editing, and deletion of single, quality, and episode links.
    - **View Tracking**: Accurate view counting with IP-based duplicate protection.
    - **Admin Management**: Secure admin login via Supabase-managed credentials and a dedicated settings tab for credential updates.
    - **API Token Management**: CRUD operations for API tokens with status toggling.
    - **Timer Skip System**: IP-based ad view session tracking to skip timers for returning users.
    - **Universal API**: A secure, token-based API for creating short links, compatible with various external services. API-created links always have ads enabled.

### Database
- **Technology**: Supabase (PostgreSQL backend).
- **Data Persistence**: All application data, including movie links, API tokens, admin settings, and ad view sessions, is stored in Supabase.
- **Key Tables**:
    - `movie_links`: Stores single movie link details (id, movieName, originalLink, shortId, views, dateAdded, adsEnabled).
    - `quality_movie_links`: Stores movie links with multiple quality options.
    - `quality_episodes`: Manages episode series with structured episode data and quality options.
    - `api_tokens`: Stores API token information for external service integration.
    - `admin_settings`: Manages dynamic admin login credentials.
    - `ad_view_sessions`: Tracks IP addresses for timer skip functionality.

### API Endpoints
- `GET /api/movie-links`: Retrieve all movie links.
- `POST /api/movie-links`: Create a new movie link.
- `POST /api/create-short-link`: Universal API for creating short links (input: movieName, originalLink; output: shortUrl).
- `GET /api/movie-links/:shortId`: Fetch a specific movie link by its short ID.
- `PATCH /api/movie-links/:shortId/views`: Update the view count for a link.
- `PATCH /api/movie-links/:id`: Modify the original URL of a movie link.
- `DELETE /api/movie-links/:id`: Remove a movie link.
- Additional endpoints for quality movie links and quality episodes management.

## External Dependencies
- **Supabase**: Used as the primary database for all data storage and management.
- **Render**: Recommended platform for backend server deployment.
- **Netlify**: Recommended platform for frontend client deployment.