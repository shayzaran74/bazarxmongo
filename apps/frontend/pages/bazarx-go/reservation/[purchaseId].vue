<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
<!-- Header -->
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
      <div class="max-w-xl mx-auto flex items-center gap-4 px-5 py-4">
        <NuxtLink to="/bazarx-go/wallet" class="p-2 rounded-full hover:bg-[var(--surface)] transition-all">
          <ArrowLeftIcon class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="font-black text-lg leading-none">Rezervasyon Yap</h1>
          <p class="text-xs text-black/40 mt-0.5">Tarih ve saatini seç</p>
        </div>
      </div>
    </header>

    <div class="max-w-xl mx-auto px-5 py-8 space-y-8">

      <!-- QR Özet kartı -->
      <div class="bg-white rounded-3xl border border-black/[0.06] p-6 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center text-2xl shrink-0">🎟️</div>
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-black/40">Rezervasyon için QR</p>
          <p class="font-black text-base">{{ purchase?.menuTitle || 'Menü' }}</p>
          <p class="text-xs text-black/40 font-mono mt-0.5">{{ purchaseId?.slice(0, 12) }}...</p>
        </div>
      </div>

      <!-- Adım 1: Restoran -->
      <div class="space-y-4">
        <h2 class="font-black text-base flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[var(--ink)] text-white flex items-center justify-center text-xs font-black">1</span>
          Restoran Seç
        </h2>
        <div class="space-y-2">
          <div v-for="v in vendors" :key="v.id"
            class="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 cursor-pointer transition-all"
            :class="form.vendorId === v.id
              ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5'
              : 'border-black/[0.06] hover:border-black/20'"
            @click="form.vendorId = v.id">
            <div class="w-12 h-12 rounded-2xl bg-[var(--surface)] overflow-hidden shrink-0">
              <img v-if="v.logo" :src="v.logo" class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center text-xl">🍽️</div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-black text-sm truncate">{{ v.name }}</p>
              <p class="text-xs text-black/40 truncate">{{ v.address }}</p>
            </div>
            <div v-if="form.vendorId === v.id"
              class="w-5 h-5 rounded-full bg-[var(--brand-deep)] flex items-center justify-center shrink-0">
              <CheckIcon class="w-3 h-3 text-white" />
            </div>
          </div>
          <div v-if="vendors.length === 0" class="text-center py-6 text-black/40 text-sm">
            Bu QR için uygun restoran bulunamadı
          </div>
        </div>
      </div>

      <!-- Adım 2: Tarih -->
      <div class="space-y-4">
        <h2 class="font-black text-base flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[var(--ink)] text-white flex items-center justify-center text-xs font-black">2</span>
          Tarih Seç
        </h2>
        <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button v-for="day in availableDays" :key="day.iso"
            class="shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[72px]"
            :class="form.date === day.iso
              ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5'
              : 'border-black/[0.06] bg-white hover:border-black/20'"
            @click="form.date = day.iso">
            <span class="text-[10px] font-black uppercase tracking-wider text-black/40">{{ day.dayName }}</span>
            <span class="text-xl font-black mt-0.5">{{ day.day }}</span>
            <span class="text-[10px] text-black/40">{{ day.month }}</span>
          </button>
        </div>
      </div>

      <!-- Adım 3: Saat Dilimi -->
      <div class="space-y-4">
        <h2 class="font-black text-base flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[var(--ink)] text-white flex items-center justify-center text-xs font-black">3</span>
          Saat Seç
        </h2>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="slot in TIME_SLOTS" :key="slot"
            class="py-3 rounded-2xl border-2 text-sm font-black transition-all"
            :class="form.timeSlot === slot
              ? 'border-[var(--brand-deep)] bg-[var(--brand)]/5 text-[var(--brand-deep)]'
              : 'border-black/[0.06] bg-white hover:border-black/20'"
            @click="form.timeSlot = slot">
            {{ slot }}
          </button>
        </div>
      </div>

      <!-- Adım 4: Kişi Sayısı + Not -->
      <div class="space-y-4">
        <h2 class="font-black text-base flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-[var(--ink)] text-white flex items-center justify-center text-xs font-black">4</span>
          Detaylar
        </h2>
        <div class="bg-white rounded-3xl border border-black/[0.06] p-6 space-y-5">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-black/40 block">Kişi Sayısı</label>
            <div class="flex items-center gap-4">
              <button class="w-10 h-10 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] font-black text-lg transition-all"
                @click="form.partySize = Math.max(1, form.partySize - 1)">−</button>
              <span class="font-black text-2xl w-8 text-center">{{ form.partySize }}</span>
              <button class="w-10 h-10 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] font-black text-lg transition-all"
                @click="form.partySize = Math.min(20, form.partySize + 1)">+</button>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-black/40 block">Not (opsiyonel)</label>
            <textarea v-model="form.note" rows="2" placeholder="Özel istek veya alerji bilgisi..."
              class="w-full bg-[var(--surface)] rounded-2xl px-4 py-3 text-sm font-bold resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
          </div>
        </div>
      </div>

      <!-- Özet & Gönder -->
      <div class="bg-[var(--ink)] text-white rounded-3xl p-6 space-y-4">
        <h3 class="font-black text-base">Rezervasyon Özeti</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-white/60">Restoran</span>
            <span class="font-black">{{ selectedVendorName || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">Tarih</span>
            <span class="font-black">{{ form.date || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">Saat</span>
            <span class="font-black">{{ form.timeSlot || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">Kişi</span>
            <span class="font-black">{{ form.partySize }}</span>
          </div>
        </div>
        <button
          :disabled="!isFormValid || submitting"
          class="w-full py-4 rounded-2xl text-sm font-black transition-all"
          :class="isFormValid && !submitting
            ? 'bg-[var(--brand-deep)] hover:bg-[var(--brand)] text-white active:scale-95'
            : 'bg-white/10 text-white/40 cursor-not-allowed'"
          @click="submit">
          {{ submitting ? 'Gönderiliyor...' : 'Rezervasyon Talebi Gönder' }}
        </button>
        <p class="text-white/40 text-[10px] text-center">Restoran onayladıktan sonra bildirim alacaksın</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, CheckIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: false })
useHead({ title: 'Rezervasyon — BazarX Go' })

const route = useRoute()
const purchaseId = computed(() => route.params.purchaseId as string)

const { $api } = useApi()
const toast = useNuxtApp().$toast

interface Purchase { id: string; listingId: string; menuTitle?: string; vendorId?: string }
interface Vendor   { id: string; name: string; address?: string; logo?: string }

const purchase = ref<Purchase | null>(null)
const vendors  = ref<Vendor[]>([])
const submitting = ref(false)

const form = reactive({
  vendorId:  '',
  date:      '',
  timeSlot:  '',
  partySize: 2,
  note:      '',
})

const TIME_SLOTS = [
  '11:00-12:00', '12:00-13:00', '13:00-14:00',
  '14:00-15:00', '17:00-18:00', '18:00-19:00',
  '19:00-20:00', '20:00-21:00', '21:00-22:00',
]

// Önümüzdeki 14 gün
const availableDays = computed(() => {
  const days = []
  const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
  const MONTH_NAMES = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      iso:     d.toISOString().split('T')[0],
      day:     d.getDate(),
      dayName: DAY_NAMES[d.getDay()],
      month:   MONTH_NAMES[d.getMonth()],
    })
  }
  return days
})

const selectedVendorName = computed(() =>
  vendors.value.find(v => v.id === form.vendorId)?.name ?? ''
)

const isFormValid = computed(() =>
  form.vendorId && form.date && form.timeSlot && form.partySize >= 1
)

const fetchPurchase = async (): Promise<void> => {
  try {
    const res = await $api<{ success: boolean; data: Purchase[] }>('/api/v1/menu/wallet?all=true')
    const found = (res.data ?? []).find(p => p.id === purchaseId.value)
    if (found) {
      purchase.value = found
      // Aynı restoranı vendor listesine ekle
      if (found.vendorId) {
        vendors.value = [{ id: found.vendorId, name: 'Restoran', address: '' }]
        form.vendorId = found.vendorId
      }
    }
  } catch { toast.error('QR bilgisi yüklenemedi') }
}

const submit = async (): Promise<void> => {
  if (!isFormValid.value) return
  submitting.value = true
  try {
    await $api(`/api/v1/menu/reservation/${purchaseId.value}`, {
      method: 'POST',
      body: {
        vendorId:  form.vendorId,
        date:      new Date(form.date).toISOString(),
        timeSlot:  form.timeSlot,
        partySize: form.partySize,
        note:      form.note || undefined,
      },
    })
    toast.success('Rezervasyon talebi gönderildi! Restoran onaylayacak.')
    navigateTo('/bazarx-go/wallet')
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    toast.error(msg ?? 'Rezervasyon oluşturulamadı')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchPurchase)
</script>

<style scoped>
.bazarx-go {
  --bg: #fafaf8; --ink: #111; --brand: #ff6b35; --brand-deep: #c94b1f;
  --brand-soft: #ff9e78; --surface: #f5f5f3; --surface-2: #ebebea;
}
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
