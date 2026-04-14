# BarterBorsa Frontend — Bölüm 5: Sepet + Checkout Akışı

## SİSTEM TALİMATLARI

Bölüm 1-4 tamamlandı. Bu bölümde ürünü sepete eklemekten ödeme tamamlanana kadar tüm akış yazılacak. Stripe **kaldırıldı** — ödeme Iyzico üzerinden (backend HTML formu döner). Cüzdan ile ödeme de desteklenir.

### MUTLAK KURALLAR
- `any` tipi **YASAK** — 0 tolerans
- `@ts-ignore` / `@ts-expect-error` **YASAK**
- `console.log` **YASAK**
- `<script setup lang="ts">` zorunlu
- SSR-safe: browser API → `onMounted` veya `import.meta.client` guard
- Bölüm 1-4'te yazılan composable ve component'leri kullan
- `brand-*` ve `surface-*` Tailwind renk paleti

### ÖNEMLİ MİMARİ KARAR: STRIPE → IYZICO GEÇİŞİ

Mevcut checkout Stripe + Iyzico hibrit kullanıyor. Yeni yazımda:
- **Stripe tamamen kaldırıldı** — `@stripe/stripe-js` bağımlılığı yok
- **Iyzico** — Backend `POST /checkout` sonrası `htmlContent` döner → frontend bu HTML'i iframe/div içinde render eder
- **Cüzdan ile ödeme** — Backend `POST /checkout/wallet` ile doğrudan cüzdandan ödeme
- **Kupon** — `POST /checkout/validate-coupon` ile kupon doğrulama

### MEVCUT BACKEND API ENDPOINTLERİ

```
# Sepet
GET    /cart                          → { success, data: { items: CartItem[], summary: CartSummary } }
POST   /cart/items                    → { success, data: CartItem }     body: { listingId, quantity }
PATCH  /cart/items/:id                → { success, data: CartItem }     body: { quantity }
DELETE /cart/items/:id                → { success }
DELETE /cart                          → { success }                     Sepeti temizle

# Checkout
POST   /checkout                     → { success, data: { orderId, htmlContent? } }
       body: { 
         selectedAddressId, customAddress?, saveAddress, 
         couponCode?, paidWithXP? 
       }
       → htmlContent varsa: Iyzico ödeme formu HTML'i
       → htmlContent yoksa: doğrudan sipariş oluşturuldu (cüzdan vb.)

POST   /checkout/wallet              → { success, data: { orderId } }
       body: { selectedAddressId, customAddress?, couponCode?, paidWithXP? }
       → Cüzdan bakiyesinden ödeme

POST   /checkout/validate-coupon      → { success, data: { code, discountAmount, discountType } }
       body: { code, cartTotal }

# Kargo ücreti
GET    /system/settings?key=shippingCost,shippingTiers → { success, data: { shippingCost, shippingTiers } }

# Cüzdan bakiyesi (checkout'ta kullanılır)
GET    /wallet                        → { success, data: { balance, blockedBalance, accounts[] } }

# Adresler (Bölüm 3'te yazıldı)
GET    /users/me/addresses            → { success, data: Address[] }

# Yasal dökümanlar
GET    /policies                      → { success, data: Policy[] }
GET    /policies/:slug                → { success, data: Policy }
```

---

## 1. TİP TANIMLARI

### 1.1 `types/cart.ts`

```typescript
import type { BaseEntity } from '~/types/common'

/** Sepet ürünü */
export interface CartItem extends BaseEntity {
  listingId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    slug: string
    image: string | null
    price: number
    compareAtPrice: number | null
    stock: number
    status: string
    vendor?: { businessName: string; slug: string } | null
    category?: { name: string } | null
  }
}

/** Sepet özeti */
export interface CartSummary {
  totalItems: number
  subtotal: number
  shipping: number
  discount: number
  total: number
}

/** Sepet API response */
export interface CartData {
  items: CartItem[]
  summary: CartSummary
}
```

### 1.2 `types/checkout.ts`

```typescript
/** Checkout için adres (yeni) */
export interface CheckoutNewAddress {
  title: string
  fullName: string
  phone: string
  addressLine: string
  city: string
  district: string
}

/** Kupon */
export interface CheckoutCoupon {
  code: string
  discountAmount: number
  discountType: 'PERCENTAGE' | 'FIXED'
}

/** Checkout payload — backend'e gönderilecek */
export interface CheckoutPayload {
  selectedAddressId: string | null
  customAddress: CheckoutNewAddress | null
  saveAddress: boolean
  couponCode?: string
  paidWithXP?: number
}

/** Checkout response */
export interface CheckoutResponse {
  orderId: string
  htmlContent?: string  // Iyzico ödeme formu HTML'i
}

/** Kargo ayarları */
export interface ShippingSettings {
  shippingCost: number
  shippingTiers?: ShippingTier[]
}

export interface ShippingTier {
  min: number
  max: number
  cost: number
}

/** Checkout'ta gösterilecek yasal döküman */
export interface CheckoutPolicy {
  slug: string
  title: string
  content: string
}
```

---

## 2. CART STORE — `stores/cart.ts`

Mevcut cart store'u (Bölüm 1'de referans alındı ama tam yazılmadı) şimdi tam yaz:

```typescript
import { defineStore } from 'pinia'
import type { CartItem, CartSummary, CartData } from '~/types/cart'
import type { ApiResponse } from '~/types/api'

export const useCartStore = defineStore('cart', () => {
  const { $api } = useApi()

  const items = ref<CartItem[]>([])
  const summary = ref<CartSummary>({
    totalItems: 0,
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const itemCount = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  )
  const isEmpty = computed(() => items.value.length === 0)
  const subtotal = computed(() =>
    items.value.reduce((total, item) => total + item.price * item.quantity, 0),
  )

  // Actions
  async function fetchCart() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      items.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const response = await $api<ApiResponse<CartData>>('cart')
      if (response.success && response.data) {
        items.value = response.data.items || []
        summary.value = response.data.summary || summary.value
      }
    } catch {
      error.value = 'Sepet yüklenemedi'
    } finally {
      loading.value = false
    }
  }

  async function addItem(listingId: string, quantity = 1) {
    try {
      const response = await $api<ApiResponse<CartItem>>('cart/items', {
        method: 'POST',
        body: { listingId, quantity },
      })
      if (response.success) {
        await fetchCart()
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      return { success: false, error: e.data?.message || 'Ürün sepete eklenemedi' }
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) return removeItem(itemId)

    try {
      const response = await $api<ApiResponse<CartItem>>(`cart/items/${itemId}`, {
        method: 'PATCH',
        body: { quantity },
      })
      if (response.success) {
        await fetchCart()
        return { success: true }
      }
    } catch {
      // Hata toast useApi'de zaten gösteriliyor
    }
    return { success: false }
  }

  async function removeItem(itemId: string) {
    try {
      const response = await $api<ApiResponse<void>>(`cart/items/${itemId}`, {
        method: 'DELETE',
      })
      if (response.success) {
        await fetchCart()
        return { success: true }
      }
    } catch { /* useApi handles toast */ }
    return { success: false }
  }

  async function clearCart() {
    try {
      await $api<ApiResponse<void>>('cart', { method: 'DELETE' })
      items.value = []
      summary.value = { totalItems: 0, subtotal: 0, shipping: 0, discount: 0, total: 0 }
    } catch { /* silent */ }
  }

  return {
    items, summary, loading, error,
    itemCount, isEmpty, subtotal,
    fetchCart, addItem, updateQuantity, removeItem, clearCart,
  }
})
```

**ÖNEMLİ:** Bölüm 2'deki ProductCard'ın "Sepete Ekle" butonu şimdi gerçekten çalışmalı:
- `cartStore.addItem(product.bestListingId || product.id, 1)` çağrısı
- Toast: "Ürün sepete eklendi" veya hata mesajı
- Header'daki sepet badge'i: `cartStore.itemCount`

---

## 3. COMPOSABLE'LAR

### 3.1 `composables/useCheckout.ts`

Mevcut useCheckout'u sadeleştir — Stripe kısmı tamamen kaldırıldı:

```typescript
import type { CheckoutPayload, CheckoutResponse, CheckoutCoupon, CheckoutNewAddress, CheckoutPolicy, ShippingTier } from '~/types/checkout'
import type { ApiResponse } from '~/types/api'
import type { Address } from '~/types/account'

export function useCheckout() {
  const { $api } = useApi()
  const cartStore = useCartStore()
  const addressStore = useAddressStore()
  const authStore = useAuthStore()
  const toast = useToast()

  // Adres state
  const selectedAddressId = ref<string | null>(null)
  const showNewAddressForm = ref(false)
  const saveNewAddress = ref(true)
  const newAddress = ref<CheckoutNewAddress>({
    title: '', fullName: '', phone: '', addressLine: '', city: '', district: '',
  })

  // Ödeme state
  const selectedMethod = ref<'iyzico' | 'wallet'>('iyzico')
  const processing = ref(false)
  const paymentHtml = ref<string | null>(null)  // Iyzico HTML formu

  // Kupon state
  const couponCode = ref('')
  const appliedCoupon = ref<CheckoutCoupon | null>(null)
  const validatingCoupon = ref(false)
  const couponError = ref('')

  // Kargo
  const shippingCost = ref(50)

  // Cüzdan
  const walletBalance = ref(0)
  const walletLoading = ref(false)

  // Sözleşme
  const acceptedAgreements = ref(false)
  const policies = ref<CheckoutPolicy[]>([])

  // XP ile ödeme
  const xpDiscount = ref(0)
  const useXpPayment = ref(false)

  // Computed
  const discount = computed(() => appliedCoupon.value?.discountAmount || 0)

  const totalBeforeXp = computed(() =>
    Math.max(0, cartStore.subtotal + shippingCost.value - discount.value),
  )

  const totalToPay = computed(() =>
    Math.max(0, totalBeforeXp.value - (useXpPayment.value ? xpDiscount.value : 0)),
  )

  const isAddressValid = computed(() => {
    if (selectedAddressId.value && !showNewAddressForm.value) return true
    // Yeni adres form validasyonu
    const a = newAddress.value
    return !!(a.fullName && a.phone && a.addressLine && a.city && a.district)
  })

  const canSubmit = computed(() => {
    if (!acceptedAgreements.value) return false
    if (!isAddressValid.value) return false
    if (selectedMethod.value === 'wallet' && walletBalance.value < totalToPay.value) return false
    return true
  })

  // Actions
  async function init() {
    if (cartStore.isEmpty) {
      await cartStore.fetchCart()
      if (cartStore.isEmpty) return { success: false, redirect: '/cart' }
    }

    await Promise.allSettled([
      addressStore.fetchAddresses().then(() => {
        if (addressStore.defaultAddress) {
          selectedAddressId.value = addressStore.defaultAddress.id
        } else if (addressStore.addresses.length > 0) {
          selectedAddressId.value = addressStore.addresses[0].id
        } else {
          showNewAddressForm.value = true
        }
      }),
      fetchWalletBalance(),
      fetchShippingCost(),
      fetchPolicies(),
    ])

    return { success: true }
  }

  async function fetchWalletBalance() {
    walletLoading.value = true
    try {
      const response = await $api<ApiResponse<{ balance: number; blockedBalance: number }>>('wallet', {
        showErrorToast: false,
      })
      if (response.success && response.data) {
        walletBalance.value = Math.max(0, response.data.balance - response.data.blockedBalance)
      }
    } catch { /* cüzdan bilgisi opsiyonel */ }
    finally { walletLoading.value = false }
  }

  async function fetchShippingCost() {
    try {
      const response = await $api<ApiResponse<Record<string, string>>>('system/settings', {
        query: { key: 'shippingCost,shippingTiers' },
        showErrorToast: false,
      })
      if (response.success && response.data) {
        const cost = response.data.shippingCost
        const tiers = response.data.shippingTiers

        if (tiers) {
          const parsed = JSON.parse(tiers) as ShippingTier[]
          const tier = parsed.find((t) =>
            cartStore.subtotal >= t.min && cartStore.subtotal <= t.max,
          )
          shippingCost.value = tier ? tier.cost : 0
        } else if (cost) {
          shippingCost.value = Number(cost)
        } else {
          shippingCost.value = cartStore.subtotal >= 500 ? 0 : 50
        }
      }
    } catch {
      shippingCost.value = cartStore.subtotal >= 500 ? 0 : 50
    }
  }

  async function fetchPolicies() {
    try {
      const response = await $api<ApiResponse<CheckoutPolicy[]>>('policies', {
        showErrorToast: false,
      })
      if (response.success) policies.value = response.data || []
    } catch { /* opsiyonel */ }
  }

  async function validateCoupon(code?: string) {
    const codeToUse = code || couponCode.value
    if (!codeToUse) {
      couponError.value = 'Kupon kodu giriniz'
      return
    }
    validatingCoupon.value = true
    couponError.value = ''
    try {
      const response = await $api<ApiResponse<CheckoutCoupon>>('checkout/validate-coupon', {
        method: 'POST',
        body: { code: codeToUse, cartTotal: cartStore.subtotal },
      })
      if (response.success && response.data) {
        appliedCoupon.value = response.data
        toast.success('Kupon uygulandı')
      }
    } catch (err) {
      const e = err as { data?: { message?: string } }
      couponError.value = e.data?.message || 'Kupon geçersiz'
    } finally {
      validatingCoupon.value = false
    }
  }

  function removeCoupon() {
    appliedCoupon.value = null
    couponCode.value = ''
    couponError.value = ''
  }

  function buildPayload(): CheckoutPayload {
    return {
      selectedAddressId: !showNewAddressForm.value ? selectedAddressId.value : null,
      customAddress: showNewAddressForm.value ? newAddress.value : null,
      saveAddress: saveNewAddress.value,
      couponCode: appliedCoupon.value?.code,
      paidWithXP: useXpPayment.value ? xpDiscount.value : 0,
    }
  }

  /** Iyzico ile ödeme başlat */
  async function submitPayment(): Promise<{ success: boolean; error?: string }> {
    if (!canSubmit.value) return { success: false, error: 'Lütfen tüm alanları doldurun' }
    processing.value = true

    try {
      if (selectedMethod.value === 'wallet') {
        // Cüzdan ile ödeme
        const response = await $api<ApiResponse<{ orderId: string }>>('checkout/wallet', {
          method: 'POST',
          body: buildPayload(),
        })
        if (response.success && response.data) {
          await cartStore.fetchCart()
          toast.success('Ödeme başarılı!')
          await navigateTo(`/account/orders/${response.data.orderId}`)
          return { success: true }
        }
        return { success: false, error: response.message || 'Ödeme başarısız' }
      } else {
        // Iyzico ile ödeme
        const response = await $api<ApiResponse<CheckoutResponse>>('checkout', {
          method: 'POST',
          body: buildPayload(),
        })
        if (response.success && response.data) {
          if (response.data.htmlContent) {
            // Iyzico HTML formunu göster
            paymentHtml.value = response.data.htmlContent
            return { success: true }
          }
          // HTML yok — doğrudan sipariş oluşturuldu
          await cartStore.fetchCart()
          toast.success('Sipariş oluşturuldu!')
          await navigateTo(`/account/orders/${response.data.orderId}`)
          return { success: true }
        }
        return { success: false, error: response.message || 'Ödeme başarısız' }
      }
    } catch (err) {
      const e = err as { data?: { message?: string }; message?: string }
      return { success: false, error: e.data?.message || e.message || 'Ödeme sırasında hata oluştu' }
    } finally {
      processing.value = false
    }
  }

  return {
    // Adres
    selectedAddressId, showNewAddressForm, saveNewAddress, newAddress,
    // Ödeme
    selectedMethod, processing, paymentHtml,
    // Kupon
    couponCode, appliedCoupon, validatingCoupon, couponError,
    // Tutarlar
    shippingCost, discount, totalBeforeXp, totalToPay,
    // Cüzdan
    walletBalance, walletLoading,
    // XP
    xpDiscount, useXpPayment,
    // Sözleşme
    acceptedAgreements, policies,
    // Validasyon
    isAddressValid, canSubmit,
    // Actions
    init, validateCoupon, removeCoupon, submitPayment,
  }
}
```

---

## 4. SAYFALAR

### 4.1 `pages/cart.vue` — Sepet Sayfası

```
Layout: default
Middleware: auth (zorunlu değil ama login olmalı — guest sepet şimdilik yok)

Yapı:
- Başlık: "Sepetim"
- Loading state → UiSpinner
- Boş sepet → UiEmptyState (kalp ikonu + "Sepetiniz boş" + "Alışverişe Başla" butonu)
- Dolu sepet → 2 kolon layout:
  
  Sol (lg:col-span-2):
  - Sepet ürünleri listesi — her biri CartItem component:
    - Görsel (thumbnail, 80x80)
    - Ürün adı (link → /products/slug)
    - Vendor adı (varsa)
    - Birim fiyat
    - Miktar seçici (UiQuantitySelector: - / sayı / +)
    - Satır toplamı (birim × adet)
    - Sil butonu (çöp kutusu ikonu, onay ile)
  
  Sağ (lg:col-span-1, sticky):
  - Sipariş Özeti kartı:
    - Ara toplam
    - Tahmini kargo (500₺ üzeri ücretsiz)
    - Toplam
    - "Ödemeye Geç" butonu (UiButton, brand renkli) → navigateTo('/checkout')
    - "Alışverişe Devam Et" linki

Component'ler:
- components/cart/CartItem.vue
- components/cart/CartSummary.vue  
- components/cart/CartEmpty.vue (UiEmptyState wrapper)
- components/ui/UiQuantitySelector.vue (+/- butonlu miktar seçici)

Store: useCartStore() — fetchCart, updateQuantity, removeItem
```

### 4.2 `pages/checkout/index.vue` — Checkout Sayfası

```
Layout: default
Middleware: auth

Yapı — 2 kolon:

Sol kolon:
1. Teslimat Adresi:
   - Kayıtlı adresler radio listesi (AddressCard'lar, seçili olan vurgulu)
   - "Farklı adrese gönder" toggle → yeni adres formu açılır
   - Yeni adres formu: başlık, ad soyad, telefon, adres, il, ilçe, "bu adresi kaydet" checkbox
   - Composable: addressStore (Bölüm 3'te yazıldı)

2. Ödeme Yöntemi:
   - Radio: "Kredi/Banka Kartı (Iyzico)" | "Cüzdan ile Öde"
   - Iyzico seçili ise: bilgi metni ("Ödemeye geçtikten sonra Iyzico güvenli ödeme sayfasına yönlendirileceksiniz")
   - Cüzdan seçili ise: bakiye göster, yetersizse uyarı

3. Kupon Kodu:
   - Input + "Uygula" butonu
   - Uygulandıysa: kupon kodu + indirim tutarı + "Kaldır" butonu
   - Hata mesajı

4. Sözleşme Onayı:
   - "Mesafeli Satış Sözleşmesini okudum ve kabul ediyorum" checkbox
   - Tıklanabilir sözleşme linki → modal ile göster

Sağ kolon:
- Sipariş Özeti:
  - Ürün listesi (mini: isim + adet + fiyat)
  - Ara toplam
  - Kargo ücreti
  - Kupon indirimi (varsa)
  - XP indirimi (varsa)
  - Genel toplam (büyük, bold)
  - "Siparişi Tamamla" butonu (disabled: canSubmit false ise)

"Siparişi Tamamla" tıklanınca:
  1. submitPayment() çağır
  2. Cüzdan → başarılı → sipariş detay sayfasına redirect
  3. Iyzico → paymentHtml doldu → ödeme modal/sayfası göster

Composable: useCheckout()
```

### 4.3 `pages/checkout/payment.vue` — Iyzico Ödeme Sayfası

```
Bu sayfa paymentHtml render eder. Alternatif olarak checkout/index.vue içinde modal olarak da gösterilebilir.

Yapı:
- Geri butonu
- "Güvenli Ödeme" başlığı
- Iyzico HTML formu: v-html ile render
- Script injection: Iyzico'nun script'lerini çalıştır (onMounted'da DOM manipülasyonu)

NOT: Iyzico callback'i backend tarafında yönetilir. Başarılı ödeme sonrası backend kullanıcıyı
/checkout/result?status=success&orderId=xxx gibi bir URL'e redirect eder.
```

### 4.4 `pages/checkout/result.vue` — Ödeme Sonucu

```
Yapı:
- route.query.status === 'success':
  - Başarı ikonu (yeşil check)
  - "Siparişiniz alındı!" başlığı
  - Sipariş numarası
  - "Siparişlerimi Gör" butonu → /account/orders
  - "Alışverişe Devam Et" butonu → /products

- route.query.status === 'failed':
  - Hata ikonu (kırmızı X)
  - "Ödeme başarısız oldu" başlığı
  - "Tekrar Dene" butonu → /checkout
  - "Sepete Dön" butonu → /cart
```

---

## 5. COMPONENT'LER

### 5.1 `components/cart/CartItem.vue`

```
Props:
- item: CartItem

Emits:
- updateQuantity: (id: string, quantity: number)
- remove: (id: string)

Yapı:
- Görsel (NuxtImg, 80×80, rounded)
- Ürün adı (NuxtLink → /products/slug)
- Vendor adı (küçük, gri)
- Fiyat (birim)
- UiQuantitySelector (miktar)
- Satır toplamı: fiyat × adet
- Sil butonu (TrashIcon, kırmızı hover)

Stok kontrolü: quantity > product.stock → uyarı göster
```

### 5.2 `components/cart/CartSummary.vue`

```
Props:
- subtotal: number
- shippingCost: number
- discount: number
- total: number
- loading: boolean

Emits:
- checkout: ()

Yapı: Kart — satırlar + toplam + buton
Fiyat formatlama: useFormat().formatPrice()
```

### 5.3 `components/cart/CartEmpty.vue`

```
UiEmptyState wrapper:
- ShoppingCartIcon
- "Sepetiniz boş"
- "Alışverişe Başla" butonu → /products
```

### 5.4 `components/ui/UiQuantitySelector.vue`

```
Props:
- modelValue: number
- min: number (default: 1)
- max: number (default: 99)
- disabled: boolean

Emits:
- update:modelValue: (value: number)

Yapı: [-] [sayı] [+]
- butonu: disabled ise min'e ulaşıldıysa
+ butonu: disabled ise max'a ulaşıldıysa
```

### 5.5 `components/ui/UiPriceDisplay.vue`

```
Props:
- price: number
- compareAtPrice: number | null
- size: 'sm' | 'md' | 'lg' (default: 'md')
- showDiscount: boolean (default: true)

Yapı:
- compareAtPrice varsa: üstü çizili eski fiyat + indirim yüzdesi badge
- Ana fiyat (formatPrice ile)
```

### 5.6 `components/checkout/CheckoutAddressSection.vue`

```
Props:
- addresses: Address[]
- selectedId: string | null
- showNewForm: boolean
- newAddress: CheckoutNewAddress
- saveNew: boolean

Emits:
- update:selectedId
- update:showNewForm
- update:newAddress
- update:saveNew

Yapı:
- Kayıtlı adres radio kartları (mevcut AddressCard'ı kullan)
- "Farklı adrese gönder" toggle
- Yeni adres formu (AddressForm component'ini kullan — Bölüm 3)
```

### 5.7 `components/checkout/CheckoutPaymentSection.vue`

```
Props:
- selectedMethod: 'iyzico' | 'wallet'
- walletBalance: number
- walletLoading: boolean
- totalToPay: number

Emits:
- update:selectedMethod

Yapı:
- Radio: Iyzico kartı (kredi kartı ikonu + açıklama)
- Radio: Cüzdan kartı (bakiye göster)
- Cüzdan yetersiz → uyarı badge
```

### 5.8 `components/checkout/CheckoutCouponSection.vue`

```
Props:
- appliedCoupon: CheckoutCoupon | null
- validating: boolean
- error: string

Emits:
- apply: (code: string)
- remove: ()

Yapı:
- Kupon uygulanmamışsa: Input + "Uygula" butonu
- Kupon uygulandıysa: Kupon kodu + indirim tutarı + "Kaldır" butonu
- Hata mesajı (varsa)
```

### 5.9 `components/checkout/CheckoutOrderSummary.vue`

```
Props:
- items: CartItem[]
- subtotal: number
- shippingCost: number
- discount: number
- xpDiscount: number
- total: number

Yapı:
- Mini ürün listesi (isim + adet + fiyat)
- Ayırıcı çizgi
- Fiyat breakdown satırları
- Toplam (büyük, bold)
```

### 5.10 `components/checkout/CheckoutAgreement.vue`

```
Props:
- modelValue: boolean (accepted)
- policies: CheckoutPolicy[]

Emits:
- update:modelValue
- openPolicy: (slug: string)

Yapı:
- Checkbox + "Mesafeli Satış Sözleşmesini okudum" metni
- Sözleşme linki tıklanınca → emit openPolicy
```

### 5.11 `components/checkout/IyzicoPaymentForm.vue`

```
Props:
- htmlContent: string

Yapı:
- v-html ile Iyzico formunu render et
- onMounted'da script injection (Iyzico'nun JS dosyalarını çalıştır)

Script injection:
  const container = document.getElementById('iyzico-container')
  if (!container) return
  const scripts = container.querySelectorAll('script')
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value))
    newScript.textContent = oldScript.textContent
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
```

---

## 6. BÖLÜM 2 GÜNCELLEMELERİ

Bu bölümde Bölüm 2'deki bazı component'ler güncellenecek:

### ProductCard.vue güncelleme:
- "Sepete Ekle" butonu artık gerçekten çalışır:
  ```typescript
  const cartStore = useCartStore()
  const toast = useToast()
  
  async function handleAddToCart() {
    const result = await cartStore.addItem(props.product.bestListingId || props.product.id)
    if (result.success) toast.success('Sepete eklendi')
    else toast.error(result.error || 'Hata oluştu')
  }
  ```

### Ürün detay sayfası ([slug].vue) güncelleme:
- "Sepete Ekle" ve "Hemen Al" butonları çalışır:
  - Sepete Ekle → cartStore.addItem() + toast
  - Hemen Al → cartStore.addItem() + navigateTo('/cart')

### AppHeader.vue güncelleme:
- Sepet ikonu badge: `cartStore.itemCount`
- onMounted'da `cartStore.fetchCart()` çağrılır (auth ise)

---

## 7. i18n GÜNCELLEME — `locales/tr.json`

```json
{
  "cart": {
    "title": "Sepetim",
    "empty": "Sepetiniz boş",
    "emptyDesc": "Beğendiğiniz ürünleri sepetinize ekleyerek alışverişe başlayabilirsiniz",
    "startShopping": "Alışverişe Başla",
    "continueShopping": "Alışverişe Devam Et",
    "subtotal": "Ara Toplam",
    "shipping": "Kargo",
    "freeShipping": "Ücretsiz",
    "discount": "İndirim",
    "total": "Toplam",
    "checkout": "Ödemeye Geç",
    "removeItem": "Ürünü Kaldır",
    "removeConfirm": "Bu ürünü sepetten kaldırmak istediğinize emin misiniz?",
    "addedToCart": "Sepete eklendi",
    "stockWarning": "Bu ürün stokta sadece {stock} adet kaldı"
  },
  "checkout": {
    "title": "Ödeme",
    "subtitle": "Siparişinizi güvenli şekilde tamamlayın",
    "deliveryAddress": "Teslimat Adresi",
    "differentAddress": "Farklı adrese gönder",
    "saveAddress": "Bu adresi kaydet",
    "paymentMethod": "Ödeme Yöntemi",
    "creditCard": "Kredi/Banka Kartı",
    "creditCardDesc": "Iyzico güvenli ödeme altyapısı ile",
    "walletPayment": "Cüzdan ile Öde",
    "walletBalance": "Bakiye: {balance}",
    "insufficientBalance": "Yetersiz bakiye",
    "coupon": "Kupon Kodu",
    "applyCoupon": "Uygula",
    "removeCoupon": "Kaldır",
    "couponApplied": "Kupon uygulandı",
    "couponInvalid": "Kupon geçersiz",
    "enterCouponCode": "Kupon kodunu girin",
    "agreements": "Sözleşme Onayı",
    "acceptTerms": "Mesafeli Satış Sözleşmesini okudum ve kabul ediyorum",
    "orderSummary": "Sipariş Özeti",
    "placeOrder": "Siparişi Tamamla",
    "processing": "İşleniyor...",
    "orderSuccess": "Siparişiniz Alındı!",
    "orderSuccessDesc": "Siparişiniz başarıyla oluşturuldu",
    "orderFailed": "Ödeme Başarısız",
    "orderFailedDesc": "Ödeme işlemi tamamlanamadı",
    "tryAgain": "Tekrar Dene",
    "viewOrders": "Siparişlerimi Gör",
    "securePayment": "Güvenli Ödeme",
    "backToCart": "Sepete Dön"
  }
}
```

---

## 8. DOĞRULAMA KRİTERLERİ

1. `pnpm build` → 0 hata
2. `pnpm typecheck` → 0 hata, 0 `any`
3. Ürün detay → "Sepete Ekle" → toast + header badge güncellenir
4. Ürün detay → "Hemen Al" → sepete ekle + /cart'a redirect
5. `/cart` → Sepet sayfası: ürünler, miktar değiştirme, silme, özet
6. `/cart` → Boş sepet state düzgün
7. `/cart` → "Ödemeye Geç" → /checkout'a redirect
8. `/checkout` → Adres seçimi (kayıtlı + yeni adres)
9. `/checkout` → Ödeme yöntemi seçimi (Iyzico / Cüzdan)
10. `/checkout` → Kupon uygulama / kaldırma
11. `/checkout` → Sözleşme onayı
12. `/checkout` → Sipariş özeti doğru hesaplanmış (ara toplam + kargo - indirim = toplam)
13. `/checkout` → "Siparişi Tamamla" → Iyzico HTML formu render veya cüzdan ödeme
14. `/checkout/result` → Başarı/hata sayfası
15. Header sepet badge: tüm sayfalarda doğru sayı
16. Mobile responsive: sepet ve checkout 375px'te düzgün

---

## 9. DOSYA YAPISI ÖZETİ (Bölüm 5)

```
types/
├── cart.ts                            # CartItem, CartSummary, CartData
└── checkout.ts                        # GÜNCELLENDİ — Stripe kaldırıldı, Iyzico eklendi

stores/
└── cart.ts                            # GÜNCELLENDİ — tam implementasyon

composables/
└── useCheckout.ts                     # GÜNCELLENDİ — Stripe→Iyzico, sadeleştirildi

components/
├── cart/
│   ├── CartItem.vue
│   ├── CartSummary.vue
│   └── CartEmpty.vue
├── checkout/
│   ├── CheckoutAddressSection.vue
│   ├── CheckoutPaymentSection.vue
│   ├── CheckoutCouponSection.vue
│   ├── CheckoutOrderSummary.vue
│   ├── CheckoutAgreement.vue
│   └── IyzicoPaymentForm.vue
└── ui/
    ├── UiQuantitySelector.vue
    └── UiPriceDisplay.vue

pages/
├── cart.vue
└── checkout/
    ├── index.vue                      # Ana checkout sayfası
    ├── payment.vue                    # Iyzico HTML render (opsiyonel)
    └── result.vue                     # Ödeme sonucu

# GÜNCELLENMESİ GEREKEN DOSYALAR:
components/product/ProductCard.vue     # "Sepete Ekle" butonu çalışır hale getirildi
pages/products/[slug].vue              # "Sepete Ekle" + "Hemen Al" çalışır
components/app/AppHeader.vue           # Sepet badge cartStore.itemCount

locales/
└── tr.json                            # GÜNCELLENDİ — cart.* ve checkout.* key'leri
```

> **Not:** Her dosyayı tam implementasyonla yaz. Stripe bağımlılığı ve kodu tamamen kaldırılmış olmalı. `@stripe/stripe-js` package.json'dan silinmeli. Checkout akışının uçtan uca çalışması (sepet → adres → ödeme → sonuç) kritik.
