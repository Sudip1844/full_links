import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./shared/schema.js";

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

// Use Replit's PostgreSQL database
const connectionString = process.env.DATABASE_URL;

console.log('Using Replit PostgreSQL database connection');

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
