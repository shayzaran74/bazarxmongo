// apps/frontend/server/api/settings.get.ts
export default defineEventHandler(() => ({
  success: true,
  data: {
    siteName: 'BarterBorsa',
    maintenanceMode: false,
    features: { barter: true, auction: true, lottery: true },
    paymentMethods: ['iyzico', 'bank_transfer', 'wallet'],
  }
}))
