// apps/backend/prisma/seed.ts
// Master Plan v4.3 — MembershipPlan, VendorTier ve BazarX Go RESTAURANT Category seed verileri

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================================
// MembershipPlan başlangıç verileri (Master Plan v4.3 §Faz 1)
// =====================================================
const MEMBERSHIP_PLANS = [
  { tier: 'BRONZE_P1',  monthlyFee: 199,   annualFee: 1_990,   menuCredit: 398,   breakeven: 4_975 },
  { tier: 'BRONZE_P2',  monthlyFee: 399,   annualFee: 3_990,   menuCredit: 798,   breakeven: 7_980 },
  { tier: 'SILVER_P1',  monthlyFee: 699,   annualFee: 6_990,   menuCredit: 1_398, breakeven: 11_650 },
  { tier: 'SILVER_P2',  monthlyFee: 999,   annualFee: 9_990,   menuCredit: 1_998, breakeven: 14_271 },
  { tier: 'GOLD_P1',    monthlyFee: 1_499, annualFee: 14_990,  menuCredit: 2_998, breakeven: 18_738 },
  { tier: 'GOLD_P2',    monthlyFee: 1_999, annualFee: 19_990,  menuCredit: 3_998, breakeven: 22_211 },
  { tier: 'DIAMOND_P1', monthlyFee: 2_999, annualFee: 29_990,  menuCredit: 5_998, breakeven: 29_990 },
  { tier: 'DIAMOND_P2', monthlyFee: 4_999, annualFee: 49_990,  menuCredit: 9_998, breakeven: 41_658 },
] as const;

// =====================================================
// BazarX Go — RESTAURANT Category & CategoryAttribute (Faz 1)
// =====================================================
const RESTAURANT_ROOT = {
  name:        'Restoran',
  slug:        'restoran',
  description: 'BazarX Go restoran menüleri',
  icon:        '🍽️',
  // type alanı CategoryType enum'a göre — şemada belirtildi, mevcut değerleri kullanır
};

const RESTAURANT_SUBCATEGORIES = [
  { name: 'Pizza',        slug: 'pizza' },
  { name: 'Burger',       slug: 'burger' },
  { name: 'Kebap',        slug: 'kebap' },
  { name: 'Ev Yemeği',    slug: 'ev-yemegi' },
  { name: 'Tatlı',        slug: 'tatli' },
  { name: 'İçecek',       slug: 'icecek' },
  { name: 'Kahvaltı',     slug: 'kahvalti' },
  { name: 'Dünya Mutfağı',slug: 'dunya-mutfagi' },
];

// Restoran kategorisi için dinamik form alanları
const RESTAURANT_ATTRIBUTES = [
  { name: 'ingredients',    label: 'İçindekiler',        type: 'TEXTAREA', placeholder: 'Domates, peynir, fesleğen...', isRequired: true,  isFilterable: false, order: 1 },
  { name: 'prepTimeMinutes',label: 'Hazırlık Süresi (dk)', type: 'NUMBER',   placeholder: '20',                          isRequired: true,  isFilterable: true,  unit: 'dk', order: 2 },
  { name: 'calories',       label: 'Kalori',             type: 'NUMBER',   placeholder: '650',                          isRequired: false, isFilterable: true,  unit: 'kcal', order: 3 },
  { name: 'allergens',      label: 'Alerjenler',         type: 'TEXT',     placeholder: 'Gluten, süt, yumurta',         isRequired: false, isFilterable: true,  order: 4 },
  { name: 'spiceLevel',     label: 'Acı Seviyesi',       type: 'SELECT',   options: ['MILD','MEDIUM','HOT','EXTRA_HOT'], isRequired: false, isFilterable: true,  order: 5 },
  { name: 'dailyLimit',     label: 'Günlük Limit',       type: 'NUMBER',   placeholder: '50',                          isRequired: false, isFilterable: false, order: 6 },
  { name: 'addOnGroups',    label: 'Ek Seçenekler',      type: 'JSON',     placeholder: '[{"name":"Sos","options":[...]}]', isRequired: false, isFilterable: false, order: 7 },
] as const;

async function seedMembershipPlans(): Promise<void> {
  for (const plan of MEMBERSHIP_PLANS) {
    await prisma.membershipPlan.upsert({
      where:  { tier: plan.tier as never },
      create: {
        tier:        plan.tier as never,
        monthlyFee:  plan.monthlyFee,
        annualFee:   plan.annualFee,
        menuCredit:  plan.menuCredit,
        breakeven:   plan.breakeven,
        isActive:    true,
        benefits:    {
          xpMultiplier:      plan.tier.endsWith('P2') ? 1.5 : 1.0,
          menuRightPerMonth: 2,
          annualSaving:      plan.monthlyFee * 2,
        },
      },
      update: {
        monthlyFee: plan.monthlyFee,
        annualFee:  plan.annualFee,
        menuCredit: plan.menuCredit,
        breakeven:  plan.breakeven,
      },
    });
  }
}

async function seedRestaurantCategories(): Promise<void> {
  // Ana RESTAURANT kategorisi (CategoryType.RESTAURANT)
  const root = await prisma.category.upsert({
    where:  { slug: RESTAURANT_ROOT.slug },
    create: {
      name:        RESTAURANT_ROOT.name,
      slug:        RESTAURANT_ROOT.slug,
      description: RESTAURANT_ROOT.description,
      icon:        RESTAURANT_ROOT.icon,
      type:        'RESTAURANT',
      order:       100,
    },
    update: {
      description: RESTAURANT_ROOT.description,
      icon:        RESTAURANT_ROOT.icon,
      type:        'RESTAURANT',
    },
  });

  // Alt kategoriler (Pizza, Burger, Kebap, vs.)
  for (const sub of RESTAURANT_SUBCATEGORIES) {
    await prisma.category.upsert({
      where:  { slug: sub.slug },
      create: {
        name:     sub.name,
        slug:     sub.slug,
        type:     'RESTAURANT',
        parentId: root.id,
      },
      update: {
        type:     'RESTAURANT',
        parentId: root.id,
      },
    });
  }

  // RESTAURANT ana kategorisi için CategoryAttribute kayıtları (dinamik form alanları)
  for (const attr of RESTAURANT_ATTRIBUTES) {
    const existing = await prisma.categoryAttribute.findFirst({
      where: { categoryId: root.id, name: attr.name },
    });
    if (existing) {
      await prisma.categoryAttribute.update({
        where: { id: existing.id },
        data: {
          label:        attr.label,
          type:         attr.type,
          options:      'options' in attr ? attr.options : null,
          unit:         'unit' in attr ? attr.unit : null,
          placeholder:  attr.placeholder,
          isRequired:   attr.isRequired,
          isFilterable: attr.isFilterable,
          order:        attr.order,
        },
      });
    } else {
      await prisma.categoryAttribute.create({
        data: {
          categoryId:   root.id,
          name:         attr.name,
          label:        attr.label,
          type:         attr.type,
          options:      'options' in attr ? attr.options : undefined,
          unit:         'unit' in attr ? attr.unit : undefined,
          placeholder:  attr.placeholder,
          isRequired:   attr.isRequired,
          isFilterable: attr.isFilterable,
          isActive:     true,
          order:        attr.order,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  await seedMembershipPlans();
  await seedRestaurantCategories();
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
