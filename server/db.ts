import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const sanitizeUrl = (url?: string) => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "base" || trimmed.includes("@base")) return undefined;
  return trimmed;
};

// Primary connection string from user provided DATABASE_URL
const connectionString = sanitizeUrl(process.env.DATABASE_URL);

if (!connectionString) {
  throw new Error("No valid database connection string found in DATABASE_URL.");
}

// Ensure Replit's internal PG env vars don't interfere
const pgVars = ['PGHOST', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];
pgVars.forEach(v => {
  try {
    delete process.env[v];
  } catch (e) {}
});

export const pool = new Pool({ 
  connectionString,
  ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });
