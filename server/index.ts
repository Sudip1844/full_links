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
    process.env.CLIENT_URL || '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    // Minimal logging - removed verbose API request logging
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Server-only mode for Render deployment
  // No client serving needed - client will be hosted separately

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
