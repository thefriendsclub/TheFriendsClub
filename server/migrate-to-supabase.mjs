import { openDatabase } from './db.mjs';
import { createSupabaseRepository } from './supabase.mjs';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error('Error: Please provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) in .env or environment.');
  process.exit(1);
}

async function migrate() {
  console.log('Connecting to Supabase...');
  const supabaseRepo = createSupabaseRepository({ url, key });
  const localDb = openDatabase();

  try {
    // 1. Migrate Events
    const events = localDb.prepare('SELECT * FROM events').all();
    console.log(`Found ${events.length} local events.`);
    for (const evt of events) {
      const { data: existing } = await supabaseRepo.client
        .from('events')
        .select('id')
        .eq('title', evt.title)
        .maybeSingle();

      if (!existing) {
        await supabaseRepo.createEvent({
          title: evt.title,
          date: evt.date,
          time: evt.time,
          location: evt.location,
          description: evt.description,
          image: evt.image
        });
        console.log(` Migrated event: "${evt.title}"`);
      } else {
        console.log(` Skipped event (already exists): "${evt.title}"`);
      }
    }

    // 2. Migrate Applications
    const applications = localDb.prepare('SELECT * FROM applications').all();
    console.log(`Found ${applications.length} local applications.`);
    for (const app of applications) {
      const exists = await supabaseRepo.hasApplicationEmail(app.email);
      if (!exists) {
        await supabaseRepo.createApplication({
          name: app.name,
          email: app.email,
          phone: app.phone,
          reason: app.reason
        });
        if (app.status && app.status !== 'pending') {
          const { data: created } = await supabaseRepo.client
            .from('applications')
            .select('id')
            .eq('email', app.email.toLowerCase())
            .single();
          if (created) {
            await supabaseRepo.updateApplicationStatus(created.id, app.status);
          }
        }
        console.log(` Migrated application: "${app.email}"`);
      } else {
        console.log(` Skipped application (already exists): "${app.email}"`);
      }
    }

    // 3. Migrate Subscribers
    const subscribers = localDb.prepare('SELECT * FROM subscribers').all();
    console.log(`Found ${subscribers.length} local subscribers.`);
    for (const sub of subscribers) {
      await supabaseRepo.addSubscriber(sub.email);
      console.log(` Migrated subscriber: "${sub.email}"`);
    }

    console.log('\nMigration complete! All data successfully synced with Supabase.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    localDb.close();
  }
}

migrate();
