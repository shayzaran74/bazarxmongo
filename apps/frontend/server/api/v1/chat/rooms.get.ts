export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'Mock chat rooms fetched',
    data: [
      {
        id: 'room1',
        name: 'Genel Destek',
        lastMessage: 'Merhaba, size nasıl yardımcı olabilirim?',
        updatedAt: new Date().toISOString()
      }
    ]
  }
})
