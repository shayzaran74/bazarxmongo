<script setup lang="ts">
import { MapPinIcon, TruckIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { iller } from '~/assets/css/data/component/iller'

interface DeliveryEstimate {
  city?: string
  district?: string
  estimatedDays?: number
  estimatedDate?: string
  carrier?: string
  freeShipping?: boolean
  freeShippingThreshold?: number
}

interface Props {
  estimatedDelivery: DeliveryEstimate | null
  showAddressModal: boolean
  selectedCity: string
  selectedDistrict: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:showAddressModal', 'update:selectedCity', 'update:selectedDistrict', 'estimate'])

const ilceleriGetir = computed(() => {
  if (!props.selectedCity) return []
  return (iller as Record<string, string[]>)[props.selectedCity] || []
})

// "2026-05-25" → "25 Mayıs 2026"
const formatDate = (iso: string): string => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return iso }
}

const deliveryLabel = computed(() => {
  const d = props.estimatedDelivery
  if (!d) return ''
  const days = d.estimatedDays ?? 0
  const dayLabel = days <= 1 ? 'Yarın Teslim' : `${days} İş Günü`
  const dateStr = d.estimatedDate ? formatDate(d.estimatedDate) : ''
  return dateStr ? `${dayLabel} · ${dateStr}` : dayLabel
})

const handleCityChange = (e: Event) => {
  const city = (e.target as HTMLSelectElement).value
  emit('update:selectedCity', city)
  emit('update:selectedDistrict', '')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Quick Delivery Card -->
    <div
      class="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer group"
      @click="emit('update:showAddressModal', true)"
    >
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
          <TruckIcon class="w-6 h-6" />
        </div>
        <div class="flex-1 space-y-0.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ $t('products.detail.estimatedDelivery') }}</span>
            <span class="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{{ $t('products.detail.changeAddress') }}</span>
          </div>
          <div v-if="estimatedDelivery" class="space-y-0.5">
            <p class="text-xs font-black text-slate-900">
              {{ deliveryLabel }}
            </p>
            <div class="flex items-center gap-1.5 mt-1">
              <CheckCircleIcon v-if="estimatedDelivery.freeShipping" class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span v-if="estimatedDelivery.freeShipping" class="text-[10px] font-bold text-emerald-600">
                Ücretsiz Kargo
              </span>
              <span v-if="estimatedDelivery.city" class="text-[10px] text-slate-400">
                · {{ estimatedDelivery.city }}{{ estimatedDelivery.district ? ', ' + estimatedDelivery.district : '' }}
              </span>
            </div>
          </div>
          <p
            v-else
            class="text-xs font-bold text-slate-600"
          >
            Adres seçerek teslimat tarihini gör
          </p>
        </div>
      </div>
    </div>

    <!-- Address Selection Modal -->
    <div
      v-if="showAddressModal"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <div
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        @click="emit('update:showAddressModal', false)"
      />

      <div class="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <!-- Decoration -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl" />

        <div class="relative p-8 space-y-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                <MapPinIcon class="w-6 h-6" />
              </div>
              <div class="space-y-0.5">
                <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {{ $t('products.detail.selectDeliveryLocation') }}
                </h3>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {{ $t('products.detail.fasterDeliveryTitle') }}
                </p>
              </div>
            </div>
            <button
              class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              @click="emit('update:showAddressModal', false)"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 gap-6">
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{{ $t('checkout.address.city') }}</label>
              <select
                :value="selectedCity"
                class="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 appearance-none shadow-sm"
                @change="handleCityChange"
              >
                <option value="">
                  {{ $t('checkout.address.selectCity') }}
                </option>
                <option
                  v-for="cityName in Object.keys(iller)"
                  :key="cityName"
                  :value="cityName"
                >
                  {{ cityName }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{{ $t('checkout.address.district') }}</label>
              <select
                :value="selectedDistrict"
                class="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 transition-all font-bold text-slate-900 appearance-none shadow-sm"
                :disabled="!selectedCity"
                @change="e => emit('update:selectedDistrict', (e.target as HTMLSelectElement).value)"
              >
                <option value="">
                  {{ $t('checkout.address.selectDistrict') }}
                </option>
                <option
                  v-for="ilce in ilceleriGetir"
                  :key="ilce"
                  :value="ilce"
                >
                  {{ ilce }}
                </option>
              </select>
            </div>
          </div>

          <button
            :disabled="!selectedCity || !selectedDistrict"
            class="w-full h-16 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest transition-all hover:bg-indigo-700 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-200 active:scale-95 disabled:opacity-50"
            @click="emit('estimate')"
          >
            {{ $t('products.detail.estimateDeliveryButton') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
