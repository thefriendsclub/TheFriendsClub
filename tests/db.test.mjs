import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase, createSqliteRepository } from '../server/db.mjs';
import { createSupabaseRepository } from '../server/supabase.mjs';

test('createSqliteRepository adheres to repository interface', async () => {
  const db = openDatabase(':memory:');
  const repo = createSqliteRepository(db);

  assert.equal(repo.isSupabase, false);
  const events = await repo.getEvents();
  assert.ok(Array.isArray(events));
  assert.ok(events.length >= 3);

  const newEvt = await repo.createEvent({
    title: 'Repo Test Event',
    date: '2027-05-10',
    time: '6:00 PM',
    location: 'Test Ground',
    description: 'Testing repository adapter.',
    image: 'https://example.com/test.webp'
  });
  assert.ok(newEvt.id > 0);

  const updated = await repo.updateEvent(newEvt.id, {
    title: 'Repo Updated Event',
    date: '2027-05-10',
    time: '6:00 PM',
    location: 'Test Ground',
    description: 'Testing repository adapter.',
    image: 'https://example.com/test.webp'
  });
  assert.equal(updated, true);

  const deleted = await repo.deleteEvent(newEvt.id);
  assert.equal(deleted, true);

  await repo.close();
});

test('createSupabaseRepository validates required credentials', () => {
  assert.throws(() => {
    createSupabaseRepository({ url: '', key: '' });
  }, /Supabase URL and Service Role Key/);
});
