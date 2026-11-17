import { getRepository } from './db.mjs';
import { createApp } from './app.mjs';

const repo = getRepository();
const app = createApp(repo);
const port = process.env.PORT || 3001;
const host = process.env.HOST || '127.0.0.1';

const server = app.listen(port, host, () => {
  console.log(`The Friends Club API: http://${host}:${port}`);
  if (repo.isSupabase) {
    console.log('Database connected: Supabase (PostgreSQL)');
  } else {
    console.log('Database connected: SQLite (local fallback)');
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => {
      await repo.close();
      process.exit(0);
    });
  });
}
