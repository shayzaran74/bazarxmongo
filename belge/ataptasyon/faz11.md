FAZ 11 — Final Polish (i18n, PWA, SEO, TypeCheck)

📦 FAZ 11 — Gemini Prompt

# GÖREV: Final Polish — TypeScript + i18n + SEO + PWA

## YAPILACAKLAR

### 1. TypeScript strict temizlik
`pnpm typecheck` çalıştır. Hata varsa kategorile:
- Missing type export → `@barterborsa/shared-types` package'ından import et
- `any` kullanımı → proper type ile replace et
- Unresolved component → skeleton bileşen oluştur

### 2. i18n eksik key'leri tamamla
`locales/tr.json` ve `locales/en.json` içinde:
- `common.error`, `common.serverConnectionError`, `common.unexpectedError`
- `common.accessDenied`, `nav.ecoBazarX`, `nav.ecoTicariTakas`, `nav.ecoBarterBorsa`
- Auth mesajları: `auth.loginSuccess`, `auth.logoutSuccess`

### 3. SEO — useHead per sayfa
Kritik sayfalara `useHead` ekle:
```typescript
// pages/products/[...slug].vue içinde
useHead({
  title: () => product.value?.name ? `${product.value.name} | BarterBorsa` : 'Ürün',
  meta: [
    { name: 'description', content: () => product.value?.description?.slice(0, 160) ?? '' }
  ]
})
```

### 4. PWA manifest doğrulama
`public/icon-192x192.png` ve `public/icon-512x512.png` var mı?
Nuxt PWA config'in `manifest.icons` doğru path'e bakıyor mu?

### 5. Error boundary
`app.vue`'ya global error handler ekle:
```typescript
onErrorCaptured((err) => {
  console.error('[App] Unhandled error:', err)
  return false // Prevent propagation
})
```

### 6. Son build doğrulama
```bash
pnpm typecheck  # 0 hata
pnpm build      # successful build
```

## Kısıtlamalar
- `any` = 0
- Build hatası = 0
- TypeScript strict mode aktif