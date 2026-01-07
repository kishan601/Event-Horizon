import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Use the database URL provided by the user in the prompt if secrets are not loading correctly
const databaseUrl = "postgresql://neondb_owner:npg_Gwzmrs94lpHV@ep-noisy-wind-adj6oeos-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
