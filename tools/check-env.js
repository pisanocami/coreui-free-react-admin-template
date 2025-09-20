import 'dotenv/config';

console.log('Checking NEON_DATABASE_URL...');
const dbUrl = process.env.NEON_DATABASE_URL;

if (dbUrl) {
  console.log('✅ NEON_DATABASE_URL is loaded.');
  // For security, let's not print the full URL. We'll just show a part of it.
  const partialUrl = dbUrl.substring(0, dbUrl.indexOf('@'));
  console.log(`   Value starts with: ${partialUrl}@...`);
} else {
  console.log('❌ ERROR: NEON_DATABASE_URL is NOT found.');
  console.log('   Please ensure you have a .env file or have set up secrets correctly in your environment.');
}
