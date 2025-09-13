# MovieZone Admin Panel

## Overview
MovieZone is a movie link shortening service designed for admins to create short, shareable links for movie downloads. It includes an admin panel for comprehensive link management and a redirect page that handles the short URLs, optionally displaying ads to monetize views. The project aims to provide a robust, easy-to-manage platform for distributing movie content efficiently while offering flexible monetization options.

## Project Status: COMPLETED ✅
**React-to-HTML Conversion**: Successfully completed with all original features maintained and enhanced.  
**Conversion Date**: September 11, 2025  
**All Features**: Fully operational and tested

## User Preferences
- Use TypeScript for all new code
- Prefer in-memory storage unless specifically asked for database persistence
- Follow modern React patterns with hooks and functional components
- Use wouter for routing instead of React Router

## System Architecture
MovieZone's architecture is split into a static frontend and an Express.js backend. The design prioritizes performance and simplified deployment.

- **Frontend**: Primarily static HTML, CSS (custom, converted from Tailwind CSS and shadcn/ui), and vanilla JavaScript. This ensures fast loading times and no complex build process. The UI maintains the original design fidelity from its React/Tailwind/shadcn days.
- **Backend**: An Express.js server developed with TypeScript, handling API requests, data management, and URL redirection.
- **Database**: PostgreSQL, managed with Drizzle ORM, for persistent storage of all movie links, admin settings, API tokens, and ad view sessions.
- **UI/UX**: Features a clean, intuitive admin panel with a 2x2 stats grid, recent links display, and separate tabs for managing Single, Quality, and Episode links. The redirect page is branded with MovieZone aesthetics, featuring a 10-second countdown timer, dynamic movie information display, and IP-based timer skip logic for improved user experience.
- **Technical Implementations**:
    - **Link Types**: Supports Single Movie Links (`/m/`), Quality Movie Links (multiple qualities under one short URL), and Quality Episode Links (`/e/`) for series.
    - **Universal API**: A secure, token-based API allows external services (e.g., Telegram bots) to create links programmatically. API-generated links automatically have ads enabled.
    - **Security**: Admin login credentials and API tokens are managed dynamically via the Supabase database, ensuring secure access and real-time updates. Environment variables are used for sensitive configurations like Supabase service keys.
    - **View Tracking**: Implements robust view counting with IP-based duplicate protection to prevent artificial inflation and ensure accurate statistics.
    - **Timer Skip System**: An IP-based system tracks ad views, allowing users to skip the 10-second timer for 5 minutes on the same link, enhancing user experience without compromising ad exposure.
    - **Data Handling**: Uses Supabase for all data persistence, removing all local memory storage dependencies. Supabase REST API client is used to bypass network restrictions.
    - **Routing**: Wouter is used for client-side routing in the admin panel, while server-side Express routes handle short URL redirection (`/m/:shortId`, `/e/:shortId`, `/z/:shortId`).
    - **API Design**: Comprehensive RESTful API endpoints for CRUD operations on movie links, quality links, episodes, API tokens, and admin settings.

## **⚠️ CRITICAL HOSTING CONFIGURATION ⚠️**

**🚨 WARNING: DO NOT HOST CLIENT ON REPLIT PREVIEW 🚨**

### **Production Hosting Setup:**
- **Client (Frontend)**: Must be hosted on **Netlify** only
- **Server (Backend)**: Must be hosted on **Render** only  
- **Development**: Use Replit only for code editing and git operations

### **Why Replit Preview Causes Issues:**
1. **CORS Problems**: Server is configured only for Netlify origin, dual hosting breaks CORS
2. **API Failures**: Dual origin hosting causes authentication and API call failures
3. **Tab Switching Issues**: Content disappears due to cross-origin conflicts
4. **Form Submission Failures**: All 4 link generators fail due to CORS blocks
5. **Data Loading Issues**: Recent links, statistics, and database tables fail to load

### **Proper Development Workflow:**
1. Edit code in Replit (DO NOT use preview)
2. Git push manually from Replit to update both hosts  
3. Test on Netlify production URL only
4. Never rely on Replit preview for functional testing

**📝 Note:** This configuration prevents CORS issues and ensures all features work correctly.

## External Dependencies
- **PostgreSQL (via Supabase)**: Primary database for all persistent data storage.
- **Express.js**: Web application framework for the backend.
- **Drizzle ORM**: Used for interacting with the PostgreSQL database.
- **@tanstack/react-query**: Utilized for efficient API calls and state management (though client has been converted to static HTML, this was part of the original React architecture).
- **Wouter**: Lightweight routing library used for frontend navigation (from React architecture).
- **Supabase REST API client**: Used for secure, direct interaction with the Supabase database, bypassing network restrictions.