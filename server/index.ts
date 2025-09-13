import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();

// Enable CORS for cross-origin requests (client on Netlify, server on Render)
app.use(cors({
  origin: [
    'https://mkvmoviepoint.netlify.app',
    'http://localhost:5173', // For local development
    'http://localhost:5000', // For local development
    /^https:\/\/.*\.replit\.app$/, // Allow all Replit app domains
    /^https:\/\/.*\.replit\.dev$/, // Allow all Replit dev domains
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware (simplified)
app.use((req, res, next) => {
  log(`${req.method} ${req.path}`);
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // API Status endpoint for Replit preview (no client files served)
  app.get('/', (req, res) => {
    res.json({
      status: 'Server Running',
      message: 'MovieZone API Server is active',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/auth-status',
        'POST /api/login',
        'POST /api/logout', 
        'GET /api/movie-links',
        'POST /api/movie-links',
        'GET /api/quality-movie-links',
        'POST /api/quality-movie-links',
        'GET /api/quality-episodes',
        'POST /api/quality-episodes',
        'GET /api/quality-zips',
        'POST /api/quality-zips',
        'GET /api/tokens',
        'POST /api/tokens'
      ],
      note: 'Client is hosted on Netlify, not on Replit'
    });
  });

  // Catch-all for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.status(404).json({
      error: 'Client not served from this server',
      message: 'Please visit the Netlify hosted client',
      apiStatus: 'Available'
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error ${status}: ${message}`, "error");
    res.status(status).json({ message });
    // Don't throw after sending response to prevent server crashes
  });

  // For Render deployment, use process.env.PORT. For development, use 5000
  const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 10000 : 5000);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log('Status: Active');
  });
})();
