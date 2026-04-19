export default defineEventHandler((event) => {
  return {
    success: true,
    data: {
      stats: {
        totalRevenue: 0,
        totalSalesCount: 0,
        uniqueOrders: 0,
        averageOrderValue: 0
      },
      topProducts: [],
      chartData: [],
      distribution: [],
      returns: []
    }
  }
})
