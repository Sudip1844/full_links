import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./shared/schema.js";

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

// Use Supabase connection from .env file (not Replit's PostgreSQL)
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Sudipb184495@db.ztorzqnvzxbptmdmaqyi.supabase.co:5432/postgres";

console.log('Using Supabase database connection');

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Check env-config.js or environment variables.",
  );
}

const client = postgres(connectionString, { 
  ssl: { rejectUnauthorized: false },
  max: 1,
  connection: {
    application_name: 'moviezone_app'
  },
  connect_timeout: 10,
  idle_timeout: 20
});
export const db = drizzle(client, { schema });
