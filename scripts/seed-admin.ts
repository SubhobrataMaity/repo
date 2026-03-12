/**
 * Utility: Generate a bcrypt hash for a given password.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *   npx tsx scripts/seed-admin.ts myNewPassword
 *
 * The output hash can be inserted into the admin_users table:
 *   UPDATE admin_users SET password_hash = '<output>' WHERE id = '<your-id>';
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';

const password = process.argv[2] ?? 'password';
const COST = 12;

async function main() {
  console.log(`\nGenerating bcrypt hash for password: "${password}"`);
  const hash = await bcrypt.hash(password, COST);
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('Hash:', hash);
  console.log('─────────────────────────────────────────────────────────');
  console.log('\nTo update the admin password, run this SQL in Supabase:');
  console.log(`  UPDATE public.admin_users SET password_hash = '${hash}';`);
  console.log('');
}

main().catch(console.error);
