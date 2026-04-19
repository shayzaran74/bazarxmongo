export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Mock barter offers fetched',
    data: [
      {
        id: '1',
        type: 'STOK',
        status: 'PENDING',
        product: {
          id: 'p1',
          name: 'Örnek Barter Ürünü',
          price: 1500,
          image: 'https://placehold.co/100'
        },
        offeredBy: {
          id: 'u1',
          name: 'Firma A'
        },
        createdAt: new Date().toISOString()
      }
    ]
  }
})
