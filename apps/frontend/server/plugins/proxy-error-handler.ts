// server/plugins/proxy-error-handler.ts
// Backend proxy bağlantı hatalarını yakalar, Nuxt restart döngüsünü önler

export default defineNitroPlugin(() => {
  process.on('unhandledRejection', (reason: any) => {
    const code: string = reason?.code ?? reason?.cause?.code ?? ''
    const isNetworkError = ['ECONNRESET', 'EPIPE', 'ECONNREFUSED', 'ETIMEDOUT'].includes(code)

    if (isNetworkError) {
      console.warn(`[ProxyGuard] Backend bağlantı hatası yakalandı (${code}) — Nuxt yeniden başlatılmıyor.`)
      return
    }

    // Gerçek beklenmedik hatalar için tekrar fırlat
    throw reason
  })
})
