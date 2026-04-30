// apps/backend/prisma/seed.ts
// Master Plan v4.3 — MembershipPlan ve VendorTier başlangıç verileri

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
  console.log('🌱 MembershipPlan seed başlatılıyor...');

  for (const plan of MEMBERSHIP_PLANS) {
    await prisma.membershipPlan.upsert({
      where: { tier: plan.tier as never },
      create: {
        tier:         plan.tier as never,
        monthlyFee:   plan.monthlyFee,
        annualFee:    plan.annualFee,
        menuCredit:   plan.menuCredit,
        breakeven:    plan.breakeven,
        isActive:     true,
        benefits:     {
          xpMultiplier:    plan.tier.endsWith('P2') ? 1.5 : 1.0,
          menuRightPerMonth: 2,  // 2× aylık aidat menü hakkı
          annualSaving:    plan.monthlyFee * 2,  // 2 ay ücretsiz
        },
      },
      update: {
        monthlyFee: plan.monthlyFee,
        annualFee:  plan.annualFee,
        menuCredit: plan.menuCredit,
        breakeven:  plan.breakeven,
      },
    });
    console.log(`  ✅ ${plan.tier} — ${plan.monthlyFee}₺/ay`);
  }

  console.log('🌱 Seed tamamlandı.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
