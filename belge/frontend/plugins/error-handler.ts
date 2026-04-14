export default defineNuxtPlugin((nuxtApp) => {
  // 1. Vue Rendering and Components Errors
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('[Vue ErrorHandler]', error)
    console.error('Info:', info)
    
    // Example: send to Sentry or Analytics
    // Sentry.captureException(error, { extra: { info }})

    if (process.client) {
      // You can trigger a local toast message or handle global state
    }
  }

  // 2. Global application errors (Nuxt 3 SSR + Client)
  nuxtApp.hook('app:error', (error) => {
    console.error('[Global App Error]', error)
  })

  // 3. Vue errors hooked to Nuxt specifically
  nuxtApp.hook('vue:error', (error, instance: any, info) => {
    console.error('[Nuxt Vue Error]', error, info)
    
    // Optionally show a toast for unhandled UI errors
    const { $toast } = useNuxtApp() as any
    if ($toast) {
      $toast.error('Uygulama içinde bir hata oluştu. Lütfen tekrar deneyin.')
    }
  })

  // 4. Capture Unhandled Promise Rejections (Client Side)
  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Unhandled Rejection]', event.reason)
      // Example: Prevent default to suppress console if desired
      // event.preventDefault()
    })

    window.addEventListener('error', (event) => {
      console.error('[Window Error]', event.error || event.message)
    })
  }
})
