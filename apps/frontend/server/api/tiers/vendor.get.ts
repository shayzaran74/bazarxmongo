// apps/frontend/server/api/tiers/vendor.get.ts
export default defineEventHandler(() => ({
  success: true,
  data: { tier: 'STANDARD', commission: 0.12 }
}))
