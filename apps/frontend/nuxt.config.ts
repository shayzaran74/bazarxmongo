import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  alias: {
    '@barterborsa/shared-types': fileURLToPath(new URL('../../packages/shared/shared-types/src/index.ts', import.meta.url))
  },
  runtimeConfig: {
    public: {
       apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      minioBase: process.env.NUXT_PUBLIC_MINIO_BASE || 'http://localhost:9000/bazarx-public'
    }
  },
  compatibilityDate: '2026-04-18',
  devtools: { enabled: false },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    '@vite-pwa/nuxt'
  ],

  routeRules: {
    '/login': { redirect: '/auth/login' },
    '/register': { redirect: '/auth/register' },
    '/forgot-password': { redirect: '/auth/forgot-password' },
    '/reset-password': { redirect: '/auth/reset-password' },
    '/api/**': { proxy: `${process.env.NUXT_BACKEND_URL || 'http://localhost:3001'}/api/**` },
  },

  nitro: {
    // Socket.io Nitro üzerinden geçmez — EPIPE döngüsüne yol açar.
    // Vite devProxy ile client-side direkt bağlantı kullanılır.
  },

  i18n: {
    locales: [
      { code: 'tr', language: 'tr-TR', name: 'Türkçe' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    defaultLocale: 'tr',
    strategy: 'prefix_except_default',
    bundle: {
      optimizeTranslationDirective: false
    },
    vueI18n: fileURLToPath(new URL('./i18n.config.ts', import.meta.url))
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'TicariTakas',
      short_name: 'TicariTakas',
      theme_color: '#4f46e5',
      icons: [
        { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' }
      ]
    }
  },

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700]
    }
  },

  image: {
    domains: ['localhost', '127.0.0.1', 'loremflickr.com', 'images.unsplash.com', 'placehold.co'],
  },

  typescript: {
    typeCheck: false
  },
  
  ssr: false,

  vite: {
    optimizeDeps: {
      include: [
        '@barterborsa/shared-types',
        'socket.io-client',
        'blurhash',
        'lodash-es'
      ],
      exclude: [
        '@heroicons/vue'
      ]
    }
  },

  experimental: {
    appManifest: false
  },

  devServer: {
    port: 3002,
    host: '0.0.0.0'
  }
})