import { createInterface } from 'node:readline/promises';
import { getRepository } from './db.mjs';
import { createAdmin } from './app.mjs';

const rl = createInterface({ input: process.stdin, output: process.stdout });
try {
  const email = (process.env.ADMIN_EMAIL || await rl.question('Admin email: ')).trim();
  const password = process.env.ADMIN_PASSWORD || await rl.question('New admin password (12+ characters; input is visible): ');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 256) {
    throw new Error('A valid email and password of 12–256 characters are required.');
  }
  const repo = getRepository();
  await createAdmin(repo, email, password);
  await repo.close();
  console.log(`Admin account (${email}) saved to ${repo.isSupabase ? 'Supabase' : 'SQLite'}. Sign in at /admin.`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
