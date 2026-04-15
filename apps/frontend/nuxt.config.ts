// apps/frontend/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  ssr: true,

  alias: {
    '@barterborsa/shared-types': fileURLToPath(new URL('../../packages/shared/shared-types/src/index.ts', import.meta.url))
  },

  devtools: { enabled: true },
  
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  app: {
    head: {
      title: 'BazarX - Modern Ticaret Platformu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    'nuxt-icon',
    '@vueuse/nuxt'
  ],

  i18n: {
    locales: [
      { code: 'tr', iso: 'tr-TR', file: 'tr.json' }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'tr',
    strategy: 'no_prefix'
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api/v1'
    }
  },

  // BFF Proxy: /api/v1 -> backend
  routeRules: {
    '/api/v1/**': {
      proxy: process.env.NUXT_API_PROXY_URL || 'http://localhost:3001/api/v1/**'
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  build: {
    transpile: ['@barterborsa/shared-types']
  },

  vite: {
    ssr: {
      noExternal: ['@barterborsa/shared-types']
    }
  },

  experimental: {
    appManifest: false
  },

  compatibilityDate: '2024-04-03'
})
