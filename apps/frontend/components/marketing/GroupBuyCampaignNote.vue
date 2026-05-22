<template>
  <div class="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 p-6 space-y-5">
    <!-- Başlık -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
        <InformationCircleIcon class="w-5 h-5 text-white" />
      </div>
      <div>
        <h4 class="text-sm font-black text-slate-900 uppercase tracking-tight">Birlikte Al Nasıl Çalışır?</h4>
        <p class="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Fiyat Farkı Kupon Olarak İade Edilir</p>
      </div>
    </div>

    <!-- Adımlar -->
    <ol class="space-y-3">
      <li
        v-for="(step, i) in steps"
        :key="i"
        class="flex items-start gap-3"
      >
        <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
          {{ i + 1 }}
        </span>
        <p class="text-xs text-slate-700 leading-relaxed">{{ step }}</p>
      </li>
    </ol>

    <!-- Örnek hesaplama -->
    <div v-if="example" class="rounded-2xl bg-white border border-indigo-100 p-4 space-y-3">
      <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Örnek Hesaplama</p>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl bg-slate-50 p-3">
          <p class="text-[9px] text-slate-400 font-bold uppercase">Ödenen</p>
          <p class="text-sm font-black text-slate-900">{{ example.originalPrice.toFixed(0) }} ₺</p>
        </div>
        <div class="rounded-xl bg-emerald-50 p-3">
          <p class="text-[9px] text-emerald-600 font-bold uppercase">Final Fiyat</p>
          <p class="text-sm font-black text-emerald-700">{{ example.exampleFinalPrice.toFixed(0) }} ₺</p>
        </div>
        <div class="rounded-xl bg-amber-50 p-3">
          <p class="text-[9px] text-amber-600 font-bold uppercase">Kupon / Adet</p>
          <p class="text-sm font-black text-amber-700">{{ (example.originalPrice - example.exampleFinalPrice).toFixed(0) }} ₺</p>
        </div>
      </div>
      <p class="text-[10px] text-slate-500 leading-relaxed">{{ example.note }}</p>
    </div>

    <!-- İade penceresi ve kupon bilgisi -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex items-center gap-2 flex-1 rounded-2xl bg-white border border-slate-100 p-3">
        <ClockIcon class="w-4 h-4 text-slate-400 shrink-0" />
        <div>
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">İade Süresi</p>
          <p class="text-xs font-black text-slate-800">{{ returnWindowDays }} Gün Beklenir</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-1 rounded-2xl bg-white border border-amber-100 p-3">
        <TicketIcon class="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <p class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Kupon</p>
          <p class="text-xs font-black text-slate-800">Her alışverişte geçerli</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { InformationCircleIcon, ClockIcon, TicketIcon } from '@heroicons/vue/24/outline'

interface CampaignExample {
  originalPrice: number
  exampleFinalPrice: number
  exampleQty: number
  note: string
}

interface Props {
  steps?: string[]
  example?: CampaignExample | null
  returnWindowDays?: number
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [
    'Ürünü mevcut fiyattan satın alırsınız, bu tutar cüzdanınızdan bloke edilir.',
    'Kampanya süresince toplam sipariş arttıkça fiyat otomatik olarak düşer.',
    'Kampanya sona erince 15 günlük iade dönemi başlar.',
    'İade dönemi bitiminde sipariş − iade sayısına göre final fiyat belirlenir.',
    'Ödediğiniz fiyat ile final fiyat arasındaki fark × adet sayısı kadar kupon tanımlanır.',
    'Kuponlarınızı tüm alışverişlerde, istediğiniz zaman kullanabilirsiniz.',
  ],
  example: null,
  returnWindowDays: 15,
})

const steps = computed(() => props.steps)
const example = computed(() => props.example)
const returnWindowDays = computed(() => props.returnWindowDays)
</script>
