// apps/backend/scripts/seed-bazarxgo.ts
// Kullanım: npx ts-node -r tsconfig-paths/register scripts/seed-bazarxgo.ts

import mongoose, { connect, disconnect, Types, model } from 'mongoose';
import { randomUUID } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Şemaları doğrudan import — createModelProxy NestJS dışında çalışmaz
import { GoRestaurantSchema, GoCampaignSchema, GoCouponSchema } from '@barterborsa/shared-persistence';

// Bağlantı kurulduktan sonra modelleri oluştur
function getModels() {
  const GoRestaurant = mongoose.models['GoRestaurant'] ?? model('GoRestaurant', GoRestaurantSchema);
  const GoCampaign   = mongoose.models['GoCampaign']   ?? model('GoCampaign',   GoCampaignSchema);
  const GoCoupon     = mongoose.models['GoCoupon']     ?? model('GoCoupon',     GoCouponSchema);
  return { GoRestaurant, GoCampaign, GoCoupon };
}

// Para değerini Decimal128'e çevir
function d(val: number): Types.Decimal128 {
  return Types.Decimal128.fromString(String(val));
}

// Prototip menü item verisinden DB formatına
let _itemCounter = 0;
function menuItem(
  name: string,
  price: number,
  desc: string,
  emoji: string,
  extra: { oldPrice?: number; badge?: string } = {},
) {
  return {
    itemId: `item-${++_itemCounter}`,
    name,
    desc,
    price: d(price),
    oldPrice: extra.oldPrice ? d(extra.oldPrice) : undefined,
    emoji,
    badge: extra.badge,
    isAvailable: true,
  };
}

// ── Restoranlar ───────────────────────────────────────────────────────────────

const RESTAURANTS = [
  {
    id: randomUUID(), slug: 'kofteci-yusuf', name: 'Köfteci Yusuf',
    cuisine: 'Türk Mutfağı · Köfte', emoji: '🍢',
    categories: ['doner'], rating: 4.7, ratingCount: '2.4B',
    etaMin: 25, etaMax: 35, deliveryFee: d(0), minOrder: d(90),
    hero1: '#FF5326', hero2: '#FF8A3D',
    tag: 'Gel-Al %20', tagType: 'hot',
    promo: 'Gel-Al siparişlerde %20 indirim', isActive: true,
    sections: [
      {
        name: 'Çok Satanlar', order: 0, items: [
          menuItem('Izgara Köfte (8 adet)', 185, 'Yanında pilav, közlenmiş biber & domates', '🍢', { oldPrice: 230, badge: '%20' }),
          menuItem('Köfte Ekmek', 95, 'Acılı veya acısız, çıtır ekmekte', '🥖'),
          menuItem('Tavuk Şiş', 165, 'Marine tavuk, ızgara sebze ile', '🍗'),
        ],
      },
      {
        name: 'Yanında İyi Gider', order: 1, items: [
          menuItem('Pilav Üstü', 55, 'Tereyağlı tane pirinç', '🍚'),
          menuItem('Çoban Salata', 45, 'Mevsim sebzeleri, nar ekşili', '🥗'),
          menuItem('Ayran (büyük)', 30, 'Köpüklü, ev yapımı', '🥛'),
        ],
      },
      {
        name: 'Tatlılar', order: 2, items: [
          menuItem('Künefe', 110, 'Antep fıstıklı, sıcak servis', '🧆', { oldPrice: 130 }),
          menuItem('Sütlaç', 65, 'Fırın sütlaç, tarçınlı', '🍮'),
        ],
      },
    ],
  },
  {
    id: randomUUID(), slug: 'burger-lab', name: 'Burger Lab',
    cuisine: 'Burger · Fast Food', emoji: '🍔',
    categories: ['burger'], rating: 4.6, ratingCount: '5.1B',
    etaMin: 20, etaMax: 30, deliveryFee: d(0), minOrder: d(120),
    hero1: '#E8350C', hero2: '#FF6B35',
    tag: '1 Al 1 Bedava', tagType: 'b1g1',
    promo: 'Seçili burgerlerde 1 alana 1 bedava', isActive: true,
    sections: [
      {
        name: '1 Al 1 Bedava 🔥', order: 0, items: [
          menuItem('Double Smash Burger', 220, '2x dana köftesi, cheddar, özel sos', '🍔', { badge: '1+1' }),
          menuItem('Tavuklu Crispy Burger', 185, 'Çıtır tavuk göğsü, ranch, turşu', '🍔', { badge: '1+1' }),
        ],
      },
      {
        name: 'Burgerler', order: 1, items: [
          menuItem('Klasik Cheeseburger', 155, 'Dana köfte, cheddar, marul, domates', '🍔'),
          menuItem('BBQ Bacon Burger', 210, 'Füme dana, bacon, BBQ sos', '🥓'),
          menuItem('Vejetaryen Burger', 165, 'Nohut köftesi, avokado, roka', '🥑'),
        ],
      },
      {
        name: 'Yanına', order: 2, items: [
          menuItem('Çıtır Patates', 60, 'Baharatlı, bol porsiyon', '🍟'),
          menuItem('Soğan Halkası', 70, 'Çıtır kaplamalı, 8 adet', '🧅'),
          menuItem('Limonata', 45, 'Taze sıkılmış, naneli', '🍋'),
        ],
      },
    ],
  },
  {
    id: randomUUID(), slug: 'pizza-locale', name: 'Pizza Locale',
    cuisine: 'İtalyan · Pizza', emoji: '🍕',
    categories: ['pizza'], rating: 4.8, ratingCount: '3.7B',
    etaMin: 30, etaMax: 40, deliveryFee: d(19), minOrder: d(150),
    hero1: '#C2410C', hero2: '#FB923C',
    tag: '%50 İndirim', tagType: 'hot',
    promo: '2. pizzada %50 indirim', isActive: true,
    sections: [
      {
        name: 'Fırından', order: 0, items: [
          menuItem('Margherita', 180, 'Mozzarella, taze fesleğen, domates sos', '🍕', { oldPrice: 230, badge: '%50' }),
          menuItem('Sucuklu Pizza', 215, 'Bol sucuk, mozzarella, kekik', '🍕'),
          menuItem('Quattro Formaggi', 245, 'Dört peynir, ceviz, bal', '🧀'),
          menuItem('Tavuklu BBQ', 225, 'BBQ tavuk, kırmızı soğan, mısır', '🍕'),
        ],
      },
      {
        name: 'Başlangıç', order: 1, items: [
          menuItem('Sarımsaklı Ekmek', 70, 'Mozzarella gratine', '🥖'),
          menuItem('Bruschetta', 85, 'Domates, fesleğen, zeytinyağı', '🍅'),
        ],
      },
      { name: 'Tatlı', order: 2, items: [menuItem('Tiramisu', 95, 'Ev yapımı, kakao tozu ile', '🍰')] },
    ],
  },
  {
    id: randomUUID(), slug: 'citir-tavuk-evi', name: 'Çıtır Tavuk Evi',
    cuisine: 'Tavuk · Fast Food', emoji: '🍗',
    categories: ['tavuk'], rating: 4.5, ratingCount: '1.9B',
    etaMin: 25, etaMax: 35, deliveryFee: d(0), minOrder: d(100),
    hero1: '#EA580C', hero2: '#FDBA74',
    tag: 'Ücretsiz Teslimat', tagType: 'free',
    promo: 'Tüm siparişlerde ücretsiz teslimat', isActive: true,
    sections: [
      {
        name: 'Kovalar', order: 0, items: [
          menuItem('8\'li Çıtır Kova', 320, '8 parça çıtır tavuk, 2 patates, 2 sos', '🍗', { badge: 'Popüler' }),
          menuItem('Tavuk Tabağı', 175, '4 parça but, patates, coleslaw', '🍗'),
        ],
      },
      {
        name: 'Sandviçler', order: 1, items: [
          menuItem('Crispy Tavuk Wrap', 130, 'Çıtır tavuk, marul, ranch dürüm', '🌯'),
          menuItem('Tavuk Burger', 145, 'Çıtır göğüs, turşu, mayonez', '🍔'),
        ],
      },
      {
        name: 'Yanına', order: 2, items: [
          menuItem('Patates Kızartması', 55, 'Çıtır, baharatlı', '🍟'),
          menuItem('Coleslaw', 40, 'Kremalı lahana salatası', '🥗'),
        ],
      },
    ],
  },
  {
    id: randomUUID(), slug: 'sushi-roll', name: 'Sushi Roll',
    cuisine: 'Japon · Sushi', emoji: '🍣',
    categories: ['sushi'], rating: 4.9, ratingCount: '980',
    etaMin: 35, etaMax: 45, deliveryFee: d(25), minOrder: d(200),
    hero1: '#9A3412', hero2: '#FB923C',
    tag: 'Yeni', tagType: 'new',
    promo: '200₺ üzeri ücretsiz teslimat', isActive: true,
    sections: [
      {
        name: 'Roll\'lar', order: 0, items: [
          menuItem('California Roll (8)', 165, 'Surimi, avokado, salatalık', '🍣'),
          menuItem('Spicy Salmon (8)', 210, 'Somon, acılı mayo, susam', '🍣', { badge: 'Acılı' }),
          menuItem('Ebi Tempura (8)', 195, 'Karides tempura, krem peynir', '🍤'),
        ],
      },
      {
        name: 'Yanına', order: 1, items: [
          menuItem('Edamame', 65, 'Deniz tuzlu', '🫛'),
          menuItem('Miso Çorba', 50, 'Tofu, deniz yosunu', '🍜'),
        ],
      },
    ],
  },
  {
    id: randomUUID(), slug: 'kahve-duragi', name: 'Kahve Durağı',
    cuisine: 'Kahve · Tatlı', emoji: '☕',
    categories: ['kahve'], rating: 4.7, ratingCount: '4.2B',
    etaMin: 15, etaMax: 25, deliveryFee: d(0), minOrder: d(60),
    hero1: '#B45309', hero2: '#FBBF24',
    tag: 'BazarPuan x2', tagType: 'puan',
    promo: 'Bu hafta çift BazarPuan', isActive: true,
    sections: [
      {
        name: 'Sıcak Kahveler', order: 0, items: [
          menuItem('Filtre Kahve', 55, 'Günün çekirdeği', '☕'),
          menuItem('Latte', 70, 'Espresso, buharda süt', '☕', { badge: 'x2 puan' }),
          menuItem('Türk Kahvesi', 50, 'Köpüklü, lokum ile', '☕'),
        ],
      },
      {
        name: 'Soğuk', order: 1, items: [
          menuItem('Ice Latte', 75, 'Buzlu, çift shot', '🧊'),
          menuItem('Soğuk Demleme', 80, '18 saat demlenmiş', '🧊'),
        ],
      },
      {
        name: 'Yanında', order: 2, items: [
          menuItem('San Sebastian', 95, 'Yanık cheesecake', '🍰'),
          menuItem('Cookie', 45, 'Çikolata parçacıklı', '🍪'),
        ],
      },
    ],
  },
  {
    id: randomUUID(), slug: 'manti-co', name: 'Mantı & Co',
    cuisine: 'Türk · Mantı', emoji: '🥟',
    categories: ['doner'], rating: 4.4, ratingCount: '760',
    etaMin: 30, etaMax: 40, deliveryFee: d(15), minOrder: d(110),
    hero1: '#DC2626', hero2: '#FB923C',
    tag: 'Gel-Al %20', tagType: 'hot',
    promo: 'Gel-Al\'da %20 indirim', isActive: true,
    sections: [
      {
        name: 'Mantılar', order: 0, items: [
          menuItem('Kayseri Mantısı', 145, 'Yoğurt, tereyağlı sos, sumak', '🥟', { oldPrice: 180, badge: '%20' }),
          menuItem('Fırın Mantı', 160, 'Kıymalı, fırınlanmış', '🥟'),
        ],
      },
      {
        name: 'Çorbalar', order: 1, items: [
          menuItem('Mercimek Çorbası', 50, 'Limon & pul biber ile', '🍲'),
        ],
      },
    ],
  },
  {
    id: randomUUID(), slug: 'tatlici-haci', name: 'Tatlıcı Hacı',
    cuisine: 'Tatlı · Baklava', emoji: '🍰',
    categories: ['tatli'], rating: 4.8, ratingCount: '2.0B',
    etaMin: 20, etaMax: 30, deliveryFee: d(0), minOrder: d(80),
    hero1: '#A16207', hero2: '#FCD34D',
    tag: '%50 İndirim', tagType: 'hot',
    promo: 'Seçili tatlılarda %50', isActive: true,
    sections: [
      {
        name: 'Baklavalar', order: 0, items: [
          menuItem('Fıstıklı Baklava (kg)', 480, 'Antep fıstığı, el açması', '🍯', { oldPrice: 560 }),
          menuItem('Şöbiyet (6 adet)', 220, 'Kaymaklı, fıstıklı', '🍯', { badge: '%50' }),
        ],
      },
      {
        name: 'Sütlü Tatlılar', order: 1, items: [
          menuItem('Profiterol', 110, 'Çikolata soslu', '🍫'),
          menuItem('Trileçe', 90, 'Karamel soslu, üç sütlü', '🍰'),
        ],
      },
    ],
  },
];

// ── Kampanyalar ───────────────────────────────────────────────────────────────

const slugMap: Record<string, string> = {};
RESTAURANTS.forEach(r => { slugMap[r.slug] = r.id; });

const CAMPAIGNS = [
  {
    id: randomUUID(), tag: 'GEL-AL', title: 'Gel-Al siparişlerde %20 indirim',
    sub: 'Kendin al, daha az öde', emoji: '🛍️', ribbon: 'Gel-Al\'da %20 İndirim',
    g1: '#FF8A1E', g2: '#FFC24D',
    validText: '1 Mayıs 2026 – 30 Haziran 2026',
    conditions: 'Kampanya, Gel-Al seçeneğiyle verilen siparişlerde geçerlidir. Sepet tutarı minimum 120₺ olmalıdır. İndirim tutarı en fazla 80₺\'dir.',
    restaurantIds: [slugMap['kofteci-yusuf'], slugMap['manti-co'], slugMap['burger-lab'], slugMap['citir-tavuk-evi']],
    couponCode: 'GELAL20', isActive: true,
  },
  {
    id: randomUUID(), tag: '1 AL 1 BEDAVA', title: 'Burger Lab\'de 1 alana 1 bedava',
    sub: 'Seçili burgerlerde', emoji: '🍔', ribbon: '1 Al 1 Bedava',
    g1: '#F2700E', g2: '#FFA63D',
    validText: 'Bu hafta boyunca · Pazar 23:59\'a kadar',
    conditions: 'Seçili burgerlerde geçerlidir. Aynı üründen 2 adet eklendiğinde ucuz olan ücretsizdir. Günlük stok ile sınırlıdır.',
    restaurantIds: [slugMap['burger-lab']],
    couponCode: undefined, isActive: true,
  },
  {
    id: randomUUID(), tag: '%50\'YE VARAN', title: 'Pizza\'da %50\'ye varan indirim',
    sub: 'Bu hafta sonu', emoji: '🍕', ribbon: '%50\'ye Varan İndirim',
    g1: '#E07A10', g2: '#FBB94C',
    validText: 'Cumartesi – Pazar',
    conditions: 'Pizza kategorisindeki seçili ürünlerde geçerlidir. 2. pizzada %50 indirim. Kampanya hafta sonu ile sınırlıdır.',
    restaurantIds: [slugMap['pizza-locale']],
    couponCode: undefined, isActive: true,
  },
  {
    id: randomUUID(), tag: 'BAZARPUAN', title: 'Her siparişte puan kazan, sonra harca',
    sub: '100₺ = 5 puan', emoji: '⭐', ribbon: 'Çift BazarPuan',
    g1: '#C98A14', g2: '#FFCF4D',
    validText: 'Sürekli',
    conditions: 'Her 100₺\'lik harcamada 5 BazarPuan kazanırsın. Bu hafta seçili restoranlarda puanlar 2 katı işler.',
    restaurantIds: [slugMap['kahve-duragi'], slugMap['tatlici-haci']],
    couponCode: undefined, isActive: true,
  },
];

// ── Kuponlar ──────────────────────────────────────────────────────────────────

const COUPONS = [
  {
    id: randomUUID(), code: 'GELAL20', label: 'Gel-Al\'da %20',
    desc: 'Min. 120₺ · Gel-Al siparişlerde',
    type: 'percent' as const, value: d(20), maxDiscount: d(80),
    minOrderAmount: d(120), isActive: true,
  },
  {
    id: randomUUID(), code: 'BENGEL50', label: 'İlk siparişe %50',
    desc: 'Yeni üyelere · Maks. 60₺',
    type: 'percent' as const, value: d(50), maxDiscount: d(60),
    minOrderAmount: d(0), isActive: true,
  },
  {
    id: randomUUID(), code: 'FLASH40', label: 'Flaş 40₺ indirim',
    desc: 'Min. 200₺ · Bugün 23:59\'a kadar',
    type: 'amount' as const, value: d(40), maxDiscount: d(40),
    minOrderAmount: d(200), isActive: true,
  },
  {
    id: randomUUID(), code: 'BEDAVA', label: 'Ücretsiz teslimat',
    desc: 'Tüm siparişlerde',
    type: 'delivery' as const, value: d(0), maxDiscount: d(0),
    minOrderAmount: d(0), isActive: true,
  },
];

// ── Seed Çalıştır ─────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI ?? process.env.DATABASE_URL ?? '';
  if (!mongoUri) {
    throw new Error('MONGODB_URI ortam değişkeni bulunamadı');
  }

  console.log('MongoDB bağlanılıyor…');
  await connect(mongoUri);
  console.log('Bağlantı sağlandı.');

  // Bağlantı kurulduktan sonra modelleri al
  const { GoRestaurant, GoCampaign, GoCoupon } = getModels();

  // Eski seed verilerini temizle
  await GoRestaurant.deleteMany({ slug: { $in: RESTAURANTS.map(r => r.slug) } });
  await GoCampaign.deleteMany({});
  await GoCoupon.deleteMany({ code: { $in: COUPONS.map(c => c.code) } });

  // Restoranlar
  for (const r of RESTAURANTS) {
    await GoRestaurant.create({ ...r, _id: r.id });
    console.log(`  Restoran: ${r.name}`);
  }

  // Kampanyalar
  for (const c of CAMPAIGNS) {
    await GoCampaign.create({ ...c, _id: c.id });
    console.log(`  Kampanya: ${c.title}`);
  }

  // Kuponlar
  for (const c of COUPONS) {
    await GoCoupon.create({ ...c, _id: c.id });
    console.log(`  Kupon: ${c.code}`);
  }

  console.log('\n✅ BazarXGO seed tamamlandı.');
  await disconnect();
}

seed().catch((err: unknown) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
