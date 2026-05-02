import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  alias: {
    '@barterborsa/shared-types': fileURLToPath(new URL('../../packages/shared/shared-types/src/index.ts', import.meta.url))
  },
  runtimeConfig: {
    // Sadece server-side (backend URL — SSR: false olduğu için kullanılmıyor ama kalabilir)
    backendUrl: process.env.NUXT_BACKEND_URL || 'http://localhost:3001',

    public: {
      // Prod'da nginx üzerinden /api/ prefix ile gidiyor
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      minioBase: process.env.NUXT_PUBLIC_MINIO_BASE || 'http://localhost:9000/bazarx-public',

      // Socket.io — prod'da aynı origin, path /socket.io/
      // Nginx upstream ile backend'e yönleniyor
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || '',  // boş = window.location.origin
    }
  },
  compatibilityDate: '2026-04-18',
  devtools: { enabled: false },

  build: {
    transpile: []
  },
  
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
    // DEV ONLY — prod'da nginx hallediyor
    ...(process.env.NODE_ENV !== 'production' && {
      '/api/**': { proxy: `${process.env.NUXT_BACKEND_URL || 'http://localhost:3001'}/api/**` },
      '/uploads/**': { proxy: `${process.env.NUXT_BACKEND_URL || 'http://localhost:3001'}/uploads/**` },
    }),
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

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' }
      ],
      meta: [
        { property: 'og:image', content: '/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'theme-color', content: '#4f46e5' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'BazarX — E-Ticaret & Takas',
      short_name: 'BazarX',
      description: "Türkiye'nin hibrit e-ticaret ve barter platformu",
      theme_color: '#4f46e5',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\/api\//,
          handler: 'NetworkFirst',
          options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
        },
      ],
    },
  },

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700]
    }
  },

  image: {
    domains: [
      'localhost', 
      '127.0.0.1', 
      'loremflickr.com', 
      'images.unsplash.com', 
      'placehold.co',
      'cdn.dsmcdn.com', // Trendyol
      'productimages.hepsiburada.net',
      'n11scdn.akamaized.net',
      'img-n11.mncdn.com'
    ],
  },

  typescript: {
    typeCheck: false
  },
  
  ssr: false,

  vite: {
    build: {
      rollupOptions: {
        external: []
      }
    },
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