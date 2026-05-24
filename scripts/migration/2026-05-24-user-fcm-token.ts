// scripts/migration/2026-05-24-user-fcm-token.ts
// Faz 5: users — fcmToken, fcmTokenUpdatedAt, notificationPreferences
// Çalıştırma: pnpm ts-node scripts/migration/2026-05-24-user-fcm-token.ts

import mongoose from 'mongoose';
import { UserSchema } from '../../packages/shared/shared-persistence/src/schemas/backend/user.schema';

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI tanımlı değil.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const User = mongoose.model('User', UserSchema);

  console.log('1) fcmToken default → null...');
  const r1 = await User.updateMany(
    { fcmToken: { $exists: false } },
    { $set: { fcmToken: null } },
  );
  console.log(`   → ${r1.modifiedCount} kayıt güncellendi.`);

  console.log('2) notificationPreferences default...');
  const r2 = await User.updateMany(
    { notificationPreferences: { $exists: false } },
    {
      $set: {
        notificationPreferences: {
          geofence: true,
          menuExpiry: true,
          instantOpportunity: true,
          silentHoursStart: 22,
          silentHoursEnd: 8,
        },
      },
    },
  );
  console.log(`   → ${r2.modifiedCount} kayıt güncellendi.`);

  await mongoose.disconnect();
  console.log('Migration tamamlandı.');
}

main().catch((err) => {
  console.error('Migration hatası:', err);
  process.exit(1);
});