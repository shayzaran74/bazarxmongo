// apps/backend/src/database/migrations/2026-05-24-order-go-fields.ts
// Düzeltme 7/8: orders koleksiyonuna isGoOrder ve goOrderMode ekle

import { MongoClient } from 'mongodb';

export async function up(client: MongoClient): Promise<void> {
  const db = client.db();

  await db.collection('orders').updateMany(
    { isGoOrder: { $exists: false } },
    { $set: { isGoOrder: false, goOrderMode: null } },
  );
}

export async function down(client: MongoClient): Promise<void> {
  const db = client.db();

  await db.collection('orders').updateMany(
    {},
    { $unset: { isGoOrder: '', goOrderMode: '' } },
  );
}