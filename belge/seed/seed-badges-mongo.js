import mongoose from 'mongoose';
import { BadgeRule } from '../../packages/shared/shared-persistence/src/schemas/backend/badgeRule.schema.ts';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

const rules = [
  {
    code: 'FOMO_URGENT',
    displayText: { tr: '🔥 Kapış Kapış! (Son Ürünler)', en: '🔥 High Demand!' },
    position: 'BOTTOM_RIGHT',
    priority: 95,
    backgroundColor: '#ef4444',
    textColor: '#ffffff',
    targetEcosystem: ['BAZARX'],
    conditionJson: {
      AND: [
        { field: 'stock', operator: 'lt', value: 4 },
        { field: 'soldCountLastHour', operator: 'gt', value: 5 }
      ]
    },
    isActive: true
  },
  {
    code: 'ELITE_EXCLUSIVE',
    displayText: { tr: '👑 Apex & Elite Özel', en: '👑 Elite Exclusive' },
    position: 'TOP_LEFT',
    priority: 100,
    backgroundColor: '#111827',
    textColor: '#facc15',
    targetEcosystem: ['TICARI_TAKAS', 'BARTER_BORSA'],
    conditionJson: {
      field: 'userTier',
      operator: 'in',
      value: ['ELITE', 'APEX']
    },
    isActive: true
  },
  {
    code: 'FREE_SHIPPING_BOOST',
    displayText: { tr: '🚀 Kargo Bedava Fırsatı!', en: '🚀 Free Shipping Opportunity!' },
    position: 'TOP_RIGHT',
    priority: 70,
    backgroundColor: '#22c55e',
    textColor: '#ffffff',
    targetEcosystem: ['BAZARX', 'TICARI_TAKAS', 'BARTER_BORSA'],
    conditionJson: {
      AND: [
        { field: 'price', operator: 'gt', value: 800 },
        { field: 'price', operator: 'lte', value: 1000 }
      ]
    },
    isActive: true
  }
];

async function main() {
  console.log('🚀 Seeding Mongoose Badge Rules...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const rule of rules) {
      const id = 'badgerule-' + rule.code.toLowerCase();
      await BadgeRule.findOneAndUpdate(
        { code: rule.code },
        {
          $set: {
            id,
            code: rule.code,
            displayText: rule.displayText,
            position: rule.position,
            priority: rule.priority,
            backgroundColor: rule.backgroundColor,
            textColor: rule.textColor,
            targetEcosystem: rule.targetEcosystem,
            conditionJson: rule.conditionJson,
            isActive: rule.isActive
          }
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Rule created/updated: ${rule.code}`);
    }

    console.log('🎉 Badge rules seeded successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
