import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Aggressively clear Replit's internal DB env vars to prevent "ENOTFOUND base"
const pgVars = ['PGHOST', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];
pgVars.forEach(v => {
  delete process.env[v];
});

const sanitizeUrl = (url?: string) => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "base" || trimmed.includes("@base")) return undefined;
  return trimmed;
};

// Use DATABASE_URL as the primary source
const connectionString = sanitizeUrl(process.env.DATABASE_URL);

if (!connectionString) {
  throw new Error("No valid database connection string found in DATABASE_URL.");
}

export const pool = new Pool({ 
  connectionString,
  ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });
