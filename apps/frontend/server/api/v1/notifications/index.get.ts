export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Mock notifications fetched',
    data: [
      {
        id: 'n1',
        title: 'Hoş geldiniz',
        message: 'BazarX platformuna hoş geldiniz!',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]
  }
})
