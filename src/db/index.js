import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.NEON_DATABASE_URL);

import * as schema from '../../drizzle/schema.js';

// Pass the schema to drizzle to get a fully typed client
export const db = drizzle(sql, { schema });
