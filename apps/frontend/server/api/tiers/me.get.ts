// apps/frontend/server/api/tiers/me.get.ts
export default defineEventHandler(() => ({
  success: true,
  data: { tier: 'STANDARD', level: 1, xp: 0, nextTierXP: 1000 }
}))
