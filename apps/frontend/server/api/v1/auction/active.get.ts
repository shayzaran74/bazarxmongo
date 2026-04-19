export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Mock active auctions fetched',
    data: [
      {
        id: 'a1',
        title: 'Lüks Saat Müzayedesi',
        status: 'ACTIVE',
        currentBid: 5000,
        endTime: new Date(Date.now() + 86400000).toISOString(),
        product: {
          id: 'p2',
          name: 'Rolex Submariner',
          image: 'https://placehold.co/400'
        }
      }
    ]
  }
})
