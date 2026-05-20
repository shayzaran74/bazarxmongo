<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
    <style>
      .bazarx-go {
        --bg: #fafaf8; --ink: #111; --brand: #ff6b35; --brand-deep: #c94b1f;
        --brand-soft: #ff9e78; --surface: #f5f5f3; --surface-2: #ebebea;
      }
    </style>

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
      <div class="max-w-2xl mx-auto flex items-center gap-4 px-5 py-4">
        <NuxtLink to="/bazarx-go" class="p-2 rounded-full hover:bg-[var(--surface)] transition-all">
          <ArrowLeftIcon class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="font-black text-lg leading-none">Referans Programı</h1>
          <p class="text-xs text-black/40 mt-0.5">3 arkadaşını davet et, bonus menü kazan</p>
        </div>
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-5 py-8 space-y-8">

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-32 bg-[var(--surface)] rounded-3xl animate-pulse" />
      </div>

      <template v-else-if="status">

        <!-- Referans kodu paylaşım kartı -->
        <div class="bg-[var(--ink)] text-white rounded-[2rem] p-8 space-y-6">
          <div class="flex items-center gap-3">
            <span class="text-4xl">🎟️</span>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest opacity-60">Referans Kodun</p>
              <p class="font-black text-2xl tracking-widest">{{ status.referralCode }}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest"
              @click="copyCode">
              {{ copied ? '✓ Kopyalandı' : '📋 Kodu Kopyala' }}
            </button>
            <button class="flex-1 py-3 rounded-2xl bg-[var(--brand-deep)] hover:bg-[var(--brand)] transition-all text-[10px] font-black uppercase tracking-widest"
              @click="shareLink">
              📲 Paylaş
            </button>
          </div>
          <p class="text-white/40 text-[10px] font-bold text-center">
            Paylaş → Arkadaşın üye olsun → 3. üye olunca bonus menü!
          </p>
        </div>

        <!-- İlerleme sayacı -->
        <div class="bg-white rounded-[2rem] border border-black/[0.06] p-7 space-y-5">
          <h2 class="font-black text-base flex items-center gap-2">
            <span>📊</span> İlerleme Durumu
          </h2>

          <!-- 3 adım progress -->
          <div class="flex items-center gap-2">
            <div v-for="n in 3" :key="n"
              class="flex-1 flex flex-col items-center gap-2">
              <div class="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all"
                :class="n <= status.stats.usedRights
                  ? 'bg-[var(--brand-deep)] text-white shadow-lg'
                  : 'bg-[var(--surface)] text-black/30'">
                {{ n <= status.stats.usedRights ? '✓' : n }}
              </div>
              <p class="text-[9px] font-black text-center text-black/40 uppercase tracking-widest">
                {{ n === 1 ? '1. Arkadaş' : n === 2 ? '2. Arkadaş' : '3. Arkadaş' }}
              </p>
              <p v-if="n <= status.stats.usedRights" class="text-[9px] font-black text-green-600 uppercase">
                +20 XP
              </p>
            </div>
          </div>

          <div class="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
            <div class="h-full bg-[var(--brand-deep)] rounded-full transition-all duration-1000"
              :style="{ width: `${(status.stats.usedRights / 3) * 100}%` }" />
          </div>

          <div class="flex justify-between text-[10px] font-black text-black/40 uppercase tracking-widest">
            <span>{{ status.stats.usedRights }} / 3 referans</span>
            <span>{{ status.stats.remaining }} hak kaldı</span>
          </div>
        </div>

        <!-- Bonus durumu -->
        <div class="rounded-[2rem] border-2 p-7 space-y-4"
          :class="status.bonus.granted
            ? 'bg-green-50 border-green-200'
            : 'bg-[var(--surface)] border-transparent'">

          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              :class="status.bonus.granted ? 'bg-green-100' : 'bg-white'">
              {{ status.bonus.granted ? '🎁' : '🎯' }}
            </div>
            <div>
              <h3 class="font-black text-sm">{{ status.bonus.granted ? 'Bonus Menü Hakkın Hazır!' : 'Bonus Hedefi' }}</h3>
              <p class="text-[10px] text-black/50 font-bold">
                {{ status.bonus.granted
                  ? `Kategori ${status.bonus.bonusCategory} — ${CATEGORY_NAMES[status.bonus.bonusCategory ?? 6]}`
                  : `${status.bonus.nextBonusNeeds} referans daha gerekiyor` }}
              </p>
            </div>
          </div>

          <!-- Bonus aktif -->
          <template v-if="status.bonus.granted && !status.bonus.expired">
            <div class="bg-white rounded-2xl p-4 space-y-2">
              <div class="flex justify-between text-xs">
                <span class="font-bold text-black/60">Bonus kategorisi</span>
                <span class="font-black">{{ CATEGORY_NAMES[status.bonus.bonusCategory ?? 6] }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="font-bold text-black/60">Son kullanım</span>
                <span class="font-black" :class="daysToExpiry <= 3 ? 'text-red-500' : 'text-gray-900'">
                  {{ daysToExpiry }} gün kaldı
                </span>
              </div>
            </div>
            <NuxtLink to="/bazarx-go/wallet"
              class="block text-center bg-green-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all">
              QR Cüzdanıma Git →
            </NuxtLink>
          </template>

          <!-- Bonus expire oldu -->
          <div v-else-if="status.bonus.expired"
            class="text-center py-3 text-red-500 text-xs font-black uppercase tracking-widest">
            ⚠️ Bonus süresi doldu — yeni referans döngüsü başlayabilir
          </div>

          <!-- Sonraki bonus önizleme -->
          <div v-else-if="status.bonus.nextBonusPreview"
            class="bg-white rounded-2xl p-4 space-y-1">
            <p class="text-[9px] font-black text-black/40 uppercase tracking-widest">Tahmini bonus (mevcut hız)</p>
            <p class="text-xs font-bold text-black/70">
              Toplam ~{{ status.bonus.nextBonusPreview.total.toLocaleString('tr-TR') }}₺ →
              <span class="font-black text-[var(--brand-deep)]">
                {{ CATEGORY_NAMES[status.bonus.nextBonusPreview.bonusCategory] }} menüsü
              </span>
            </p>
          </div>
        </div>

        <!-- Referans geçmişi -->
        <div class="bg-white rounded-[2rem] border border-black/[0.06] p-7 space-y-4">
          <h2 class="font-black text-base">Referans Geçmişi</h2>
          <div v-if="status.stats.referrals.length === 0"
            class="text-center py-8 text-black/40 text-sm font-bold">
            Henüz referans yok
          </div>
          <div v-else class="space-y-3">
            <div v-for="(r, i) in status.stats.referrals" :key="i"
              class="flex items-center justify-between py-3 border-b border-[var(--surface)] last:border-0">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[var(--brand)]/10 flex items-center justify-center font-black text-xs text-[var(--brand-deep)]">
                  {{ i + 1 }}
                </div>
                <div>
                  <p class="text-xs font-black">{{ r.tier.replace('_', ' ') }} üyesi</p>
                  <p class="text-[9px] text-black/40">{{ formatDate(r.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-black text-indigo-600">+{{ r.xpEarned }} XP</span>
                <span v-if="r.isBonus" class="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-black rounded-full">BONUS</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nasıl çalışır? -->
        <div class="bg-[var(--surface)] rounded-[2rem] p-7 space-y-4">
          <h2 class="font-black text-sm uppercase tracking-tight">Nasıl Çalışır?</h2>
          <div class="space-y-3">
            <div v-for="step in HOW_IT_WORKS" :key="step.step"
              class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-full bg-white flex items-center justify-center font-black text-xs shrink-0">{{ step.step }}</div>
              <p class="text-xs font-bold text-black/60 leading-relaxed">{{ step.text }}</p>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: false })
useHead({ title: 'Referans Programı — BazarX Go' })

const { $api } = useApi()
const toast = useNuxtApp().$toast

interface ReferralStatus {
  referralCode: string
  referralUrl:  string
  stats: {
    totalRights: number
    usedRights:  number
    remaining:   number
    referrals:   { refereeId: string; tier: string; xpEarned: number; isBonus: boolean; date: string }[]
  }
  bonus: {
    granted:         boolean
    expired:         boolean
    expiresAt:       string | null
    purchaseId:      string | null
    bonusCategory:   number | null
    nextBonusNeeds:  number
    nextBonusPreview:{ total: number; bonusTier: string; bonusCategory: number } | null
  }
}

const status  = ref<ReferralStatus | null>(null)
const loading = ref(true)
const copied  = ref(false)

const CATEGORY_NAMES: Record<number, string> = {
  1: 'VIP Fine Dining', 2: 'Mid-Point',
  3: 'Casual Dining',   4: 'Tatlı & Pastane',
  5: 'Kahve & İçecek',  6: 'Dondurma & Ekler',
}

const HOW_IT_WORKS = [
  { step: 1, text: 'Referans kodunu paylaş — arkadaşın BazarX-GO üye olurken girsin.' },
  { step: 2, text: '3 arkadaşın üye olunca bonus tetiklenir. Her referans 20 XP kazandırır.' },
  { step: 3, text: '3 arkadaşın ödediği aidatların toplamına göre bonus menü kategorisi belirlenir.' },
  { step: 4, text: 'Bonus QR cüzdanına eklenir — 45 gün içinde kullan, yoksa yanar!' },
]

const daysToExpiry = computed(() => {
  if (!status.value?.bonus.expiresAt) return 0
  return Math.max(0, Math.ceil(
    (new Date(status.value.bonus.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))
})

const fetchStatus = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await $api<{ success: boolean; data: ReferralStatus }>('/api/v1/menu/referral/my-status')
    status.value = res.data
  } catch { toast.error('Referans durumu yüklenemedi') } finally { loading.value = false }
}

const copyCode = (): void => {
  if (!status.value) return
  navigator.clipboard.writeText(status.value.referralCode)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
  toast.success('Referans kodu kopyalandı')
}

const shareLink = (): void => {
  if (!status.value) return
  const url = `${window.location.origin}${status.value.referralUrl}`
  if (navigator.share) {
    navigator.share({ title: 'BazarX-GO Referansı', text: `BazarX-GO'ya katıl, ${status.value.referralCode} kodunu kullan!`, url })
  } else {
    navigator.clipboard.writeText(url)
    toast.success('Referans linki kopyalandı')
  }
}

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })

// URL'den otomatik referans kodu varsa kaydet (üyelik sonrası yönlendirme)
const route = useRoute()
onMounted(async () => {
  await fetchStatus()
  const code = route.query.code as string | undefined
  if (code) {
    // Referans kodu URL'de geliyorsa localStorage'a kaydet; üyelik tamamlandığında kullanılır
    localStorage.setItem('bazarx_go_referral_code', code)
    toast.success(`Referans kodu "${code}" kaydedildi`)
  }
})
</script>
