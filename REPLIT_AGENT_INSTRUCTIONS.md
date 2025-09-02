# 🚨 REPLIT AGENT CRITICAL INSTRUCTIONS 🚨

## ⚠️ FORBIDDEN ACTIONS WITHOUT USER PERMISSION ⚠️

### 🔒 DO NOT MODIFY DEPLOYMENT ARCHITECTURE:

1. **Database Configuration**: 
   - ❌ DO NOT create Replit PostgreSQL database
   - ❌ DO NOT change from Supabase to any other database
   - ✅ MUST use existing Supabase configuration

2. **Client Configuration**:
   - ❌ DO NOT change Netlify deployment settings
   - ❌ DO NOT modify client hosting configuration
   - ✅ MUST maintain https://mkvmoviepoint.netlify.app

3. **Server Configuration**:
   - ❌ DO NOT change Render hosting setup
   - ❌ DO NOT modify server deployment settings  
   - ✅ MUST maintain https://full-links.onrender.com

4. **Cross-Platform Connection**:
   - ❌ DO NOT modify CORS settings
   - ❌ DO NOT change client-server communication setup
   - ✅ MUST preserve existing cross-platform architecture

## 📋 CURRENT PRODUCTION SETUP - DO NOT CHANGE:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NETLIFY       │    │     RENDER      │    │   SUPABASE      │
│   (Client)      │◄──►│   (Server)      │◄──►│  (Database)     │
│ mkvmoviepoint   │    │  full-links     │    │  PostgreSQL     │
│ .netlify.app    │    │ .onrender.com   │    │   + REST API    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔥 MANDATORY RULES FOR REPLIT AGENT:

1. **Always ask user permission** before changing deployment architecture
2. **Read all MD files** for complete project understanding  
3. **Maintain existing setup**: Netlify + Render + Supabase
4. **Do not suggest alternatives** to the current architecture
5. **Preserve professional domain visibility**
6. **Keep server infrastructure hidden** from end users
7. **Maintain revenue protection** through existing setup

## 💡 WHY THIS ARCHITECTURE EXISTS:

- **Professional Appearance**: Users only see `mkvmoviepoint.netlify.app`
- **Server Hiding**: `full-links.onrender.com` stays hidden from users
- **Revenue Protection**: Professional domain attracts more users
- **Data Persistence**: All data safely stored in Supabase
- **Cross-Platform API**: Universal API works with all external services

## 🚫 CONSEQUENCES OF UNAUTHORIZED CHANGES:

- Loss of professional domain appearance
- Broken cross-platform connections  
- Data loss or migration issues
- Revenue impact from unprofessional setup
- User trust loss due to visible server infrastructure

---

**⚠️ THIS FILE IS AUTHORITATIVE - REPLIT AGENT MUST FOLLOW THESE INSTRUCTIONS ⚠️**