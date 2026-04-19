import type { ToastInterface } from 'vue-toastification'

declare module 'nuxt/app' {
  interface NuxtApp {
    $toast: ToastInterface
  }
}

export {}
