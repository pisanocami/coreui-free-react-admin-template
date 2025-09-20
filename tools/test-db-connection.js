import { db } from '../src/db/index.js';
import { sql } from 'drizzle-orm';

async function testConnection() {
  console.log('Attempting to connect to Neon database...');
  try {
    const result = await db.execute(sql`SELECT 1 as test_value`);
    if (result && result[0] && result[0].test_value === 1) {
      console.log('✅ Success! Database connection is working.');
    } else {
      console.log('⚠️ Connection successful, but query returned unexpected result:', result);
    }
  } catch (error) {
    console.error('❌ ERROR: Failed to connect to the database.');
    console.error('   Error details:', error);
    process.exit(1);
  }
}

testConnection();
