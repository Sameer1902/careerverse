import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// For local development: if DATABASE_URL is not set, log a warning instead of crashing.
// Database operations will fail at runtime but the server will still start.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "⚠️  DATABASE_URL is not set. The server will start but database operations will fail.",
    "\n   Set DATABASE_URL in your environment to connect to PostgreSQL.",
  );
}

export const pool = new Pool({
  connectionString: databaseUrl || "postgresql://localhost:5432/careerverse",
});
export const db = drizzle(pool, { schema });

export * from "./schema";
