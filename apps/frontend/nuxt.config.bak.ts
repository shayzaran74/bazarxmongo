import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  alias: {
    '@barterborsa/shared-types': fileURLToPath(new URL('../../packages/shared/shared-types/src/index.ts', import.meta.url)),
    'debug': 'debug/dist/debug.js'
  },
  // @ts-expect-error - compatibilityDate is required by Nitro but may not be in Nuxt 3.10 types
  compatibilityDate: '2026-04-18',
  telemetry: false,
  devtools: { enabled: true },
  experimental: {
    scanPageMeta: true
  },
  sourcemap: {
    server: false,
    client: false
  },

  // CSS Framework
  css: ['~/assets/css/main.css'],

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    '@nuxtjs/sitemap',
    '@vite-pwa/nuxt',
    '@nuxtjs/i18n'
  ],
  tailwindcss: {
    viewer: false,
    config: {
      content: [
        'components/**/*.{vue,js,ts}',
        'layouts/**/*.vue',
        'pages/**/*.vue',
        'plugins/**/*.{js,ts}',
        'app.vue',
      ]
    }
  },

  // Sitemap configuration
  sitemap: {
    sources: [
      '/api/sitemap-urls' // Backend'den dinamik ürün linklerini çekecek endpoint
    ]
  },

  // Nuxt Image
  image: {
    domains: ['localhost', '127.0.0.1', '172.20.10.8.nip.io', 'loremflickr.com', 'images.unsplash.com', 'placehold.co'],
    alias: {
      backend: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001'
    }
  },

  // Google Fonts
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700]
    }
  },

  // Runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      appName: 'TicariTakas',
      appDescription: 'Ticari Takas Platformu',
      stripePublishableKey: 'pk_test_51RXSv8BBb9r8vub8ZFfj4no24OQYkgjhbPDtvlIdX9LSni434NzDV3PeY4LnXbwlX2qrDiGt8o0KTHYp46s99A6z00R0iE0vV1',
      minioBase: process.env.NUXT_PUBLIC_MINIO_BASE || 'http://localhost:9000/bazarx-public'
    }
  },

  // i18n configuration
i18n: {
  locales: [
    {
      code: 'tr',
      language: 'tr-TR',
      name: 'Türkçe',
      file: 'tr.json'
    },
    {
      code: 'en',
      language: 'en-US',
      name: 'English',
      file: 'en.json'
    }
  ],
  lazy: true,
  langDir: 'locales/',
  defaultLocale: 'tr',
  strategy: 'prefix_except_default',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root',
  },
  bundle: {
    optimizeTranslationDirective: false
  }
},
  // PWA configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'TicariTakas - Ticari Takas Platformu',
      short_name: 'TicariTakas',
      description: 'Ticari sektöründe fazla malzeme ve stokların takası için modern platform',
      theme_color: '#4f46e5',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  },

  // App config
  app: {
    head: {
      title: 'TicariTakas - Ticari Takas Platformu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover' },
        { name: 'description', content: 'TicariTakas - Ticari sektöründe fazla malzeme ve stokların takası için modern platform' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Security headers for Stripe
  nitro: {
    compatibilityDate: '2026-04-18',
    prerender: { failOnError: false },
    scanDirs: ['server'],
    externals: {
      external: ['debug'],
    },
    devProxy: {
      '/api': {
        target: (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001') + '/api/v1',
        changeOrigin: true,
        prependPath: true,
      }
    },
    routeRules: {
      '/api/**': {
        proxy: {
          to: (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001') + '/api/v1/**',
        }
      },
      // Mock endpoints overrides (proxy'ye takılmasınlar)
      '/api/auth/csrf': {},
      '/api/tiers/me': {},
      '/api/tiers/vendor': {},
      '/api/v1/barter/my-offers': {},
      '/api/v1/auction/active': {},
      '/api/v1/chat/**': {},
      '/api/v1/notifications/**': {},
      '/**': {
        headers: {
          'Content-Security-Policy': "default-src 'self' http://localhost:* http://172.20.10.8:* http://*.nip.io:* https://*.stripe.com https://*.google.com https://*.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.stripe.com https://*.google.com https://*.gstatic.com http://localhost:* http://172.20.10.8:* http://*.nip.io:*; img-src * data: blob:; media-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self' https://*.stripe.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.stripe.com https://*.google.com http://localhost:* http://172.20.10.8:* http://*.nip.io:* ws://localhost:* ws://172.20.10.8:* ws://*.nip.io:* https://nominatim.openstreetmap.org;"
        }
      }
    }
  },

  // Development server
  devServer: {
    port: 3002,
    host: '0.0.0.0'
  },

  // Vite configuration - Fixed HMR for nip.io network setup
  vite: {
    optimizeDeps: {
      exclude: ['debug'],
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        clientPort: 3002
      }
    },
    define: {
      'process.env.DEBUG': 'false',
    },
    ssr: {
      noExternal: ['socket.io-client']
    }
  },

  // Build configuration
  build: {
    transpile: [
      'vue-toastification',
      '@heroicons/vue',
      '@headlessui/vue',
      '@barterborsa/shared-types',
      'socket.io-client',
      'apexcharts',
      'vue3-apexcharts',
    ]
  },

  // TypeScript configuration
  typescript: {
    typeCheck: false
  },

  // SSR configuration
  ssr: true,

  // SEO configuration
  site: {
    url: process.env.NUXT_PUBLIC_BASE_URL || 'https://barterborsa.com',
    name: 'BarterBorsa',
    description: 'Türkiye\'nin En Büyük Ticari Takas Platformu',
    defaultLocale: 'tr'
  },

  // Exclude dev pages from production
  hooks: {
    'pages:extend'(pages) {
      if (process.env.NODE_ENV === 'production') {
        const devPages = pages.filter(p => p.path.startsWith('/__dev__'))
        devPages.forEach(p => pages.splice(pages.indexOf(p), 1))
      }
    }
  }
})