import 'dotenv/config';
import { introspect } from 'drizzle-kit/internal';
import { pg } from 'drizzle-kit/connectors/pg';

async function runManualIntrospection() {
  console.log('🚀 Starting manual introspection...');

  try {
    const connectionString = process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error('NEON_DATABASE_URL is not defined.');
    }

    console.log('   Connecting to database...');
    const connector = pg.default(connectionString);

    console.log('   Running introspection logic...');
    const result = await introspect(connector, {
      schema: './src/db/schema.js',
      out: './drizzle',
    });

    console.log('✅ Introspection completed.');
    console.log('   Result:', result);
    
  } catch (error) {
    console.error('❌ ERROR during manual introspection:');
    console.error(error);
    process.exit(1);
  }
}

runManualIntrospection();
