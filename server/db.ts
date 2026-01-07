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

const externalUrl = sanitizeUrl(process.env.DATABASE_URL_EXTERNAL_LINK);
const internalUrl = sanitizeUrl(process.env.DATABASE_URL);

let connectionString = externalUrl || internalUrl;

if (!connectionString) {
  throw new Error("No valid database connection string found.");
}

// Replit's environment often injects PG* variables that conflict with connectionString.
// We remove them completely to ensure connectionString is the source of truth.
const pgVars = ['PGHOST', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];
pgVars.forEach(v => delete process.env[v]);

export const pool = new Pool({ 
  connectionString,
  ssl: connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });
