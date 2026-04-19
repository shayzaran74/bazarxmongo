FAZ 2 — Frontend Altyapı: Bağımlılıklar + Config

Hedef: package.json ve nuxt.config.ts'yi belge/frontend standartlarına taşı.
Var olan UI bileşenlerini koru


# GÖREV: Frontend Altyapı Güncelleme — Bağımlılıklar + Konfigürasyon

## Mevcut Durum
apps/frontend zaten çalışır durumda. Nuxt 3.10.3, Tailwind, Pinia,
vue-toastification, socket.io-client, tiptap, apexcharts ve stripe yüklü.

## YAPILACAKLAR

### 1. package.json kontrolü
Şu paketlerin `dependencies` veya `devDependencies` içinde olduğunu doğrula,
eksikse ekle (mevcut versiyonları değiştirme):
- `vee-validate` ^4.11.8
- `@vee-validate/rules` ^4.11.8
- `@vee-validate/i18n` ^4.11.8
- `yup` ^1.3.3
- `vuedraggable` ^4.1.0
- `lodash-es` ^4.17.22
- `blurhash` ^2.0.5
- `uuid` ^13.0.0

### 2. nuxt.config.ts — tailwindcss content genişlet
`@nuxtjs/tailwindcss` modülü config'ine content path'i ekle:
```typescript
// nuxt.config.ts içinde modules tanımından sonra
tailwindcss: {
  exposeConfig: false,
  config: {
    content: [
      './components/**/*.{vue,js,ts}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './plugins/**/*.{js,ts}',
      './composables/**/*.{js,ts}',
      './stores/**/*.{js,ts}',
    ]
  }
}
```

### 3. nuxt.config.ts — build.transpile
Mevcut transpile listesine eksikleri ekle (duplicate olmadan):
```typescript
build: {
  transpile: [
    'vue-toastification',
    '@heroicons/vue',
    'socket.io-client',
    'apexcharts',
    'vue3-apexcharts',
  ]
}
```

### 4. tailwind.config.js güncelle
`apps/frontend/tailwind.config.js` dosyasına `primary` renk paleti ekle
(mevcut renkler korunur, sadece eksik `primary` grubu eklenir):
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50:  '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  }
}
```

### 5. plugins/veevalidate.client.ts oluştur
```typescript
import { defineRule, configure } from 'vee-validate'
import { required, email, min, max, confirmed } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import tr from '@vee-validate/i18n/dist/locale/tr.json'

export default defineNuxtPlugin(() => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('max', max)
  defineRule('confirmed', confirmed)

  configure({
    generateMessage: localize({ tr }),
  })
})
```

## Kısıtlamalar
- Mevcut plugin dosyalarını silme (stripe.client.ts, apexcharts.client.ts vb.)
- Mevcut composable'ları silme
- `pnpm typecheck` 0 hata
- `pnpm build` başarılı