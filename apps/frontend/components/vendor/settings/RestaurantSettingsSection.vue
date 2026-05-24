<script setup lang="ts">
import { ClockIcon, MapPinIcon, BanknotesIcon, CheckCircleIcon, TruckIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  form: any
}>()

const emit = defineEmits(['update:form'])

const updateField = (field: string, value: any) => {
  props.form[field] = value
  emit('update:form', props.form)
}
</script>

<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-8 border-b border-gray-50 flex items-center gap-4">
      <div class="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
        <ClockIcon class="w-6 h-6 text-orange-600" />
      </div>
      <div>
        <h2 class="text-xl font-black text-gray-900 italic tracking-tighter uppercase">Restoran Ayarları</h2>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Çalışma Saatleri ve Teslimat</p>
      </div>
    </div>

    <div class="p-10 space-y-10">
      <!-- Opening Hours -->
      <div>
        <h3 class="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ClockIcon class="h-4 w-4" /> Çalışma Saatleri
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="day in ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']" :key="day" class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ day }}</label>
            <div class="flex items-center gap-2">
              <input
                :value="form.openingHours?.[day]?.open || '09:00'"
                type="time"
                class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                @input="e => {
                  if (!form.openingHours) form.openingHours = {}
                  if (!form.openingHours[day]) form.openingHours[day] = { open: '', close: '' }
                  form.openingHours[day].open = (e.target as HTMLInputElement).value
                }"
              >
              <span class="text-gray-300 font-black">-</span>
              <input
                :value="form.openingHours?.[day]?.close || '22:00'"
                type="time"
                class="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                @input="e => {
                  if (!form.openingHours) form.openingHours = {}
                  if (!form.openingHours[day]) form.openingHours[day] = { open: '', close: '' }
                  form.openingHours[day].close = (e.target as HTMLInputElement).value
                }"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Settings -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="space-y-3">
          <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <MapPinIcon class="h-4 w-4" /> Teslimat Yarıçapı (km)
          </label>
          <input
            :value="form.deliveryRadius"
            type="number"
            step="0.5"
            min="1"
            max="50"
            class="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="5"
            @input="e => form.deliveryRadius = Number((e.target as HTMLInputElement).value)"
          >
        </div>
        <div class="space-y-3">
          <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <BanknotesIcon class="h-4 w-4" /> Minimum Sipariş Tutarı (₺)
          </label>
          <input
            :value="form.minOrderAmount"
            type="number"
            step="1"
            min="0"
            class="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500"
            placeholder="50"
            @input="e => form.minOrderAmount = Number((e.target as HTMLInputElement).value)"
          >
        </div>
        <div class="space-y-3">
          <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ortalama Teslimat Süresi (dk)</label>
          <input
            :value="form.avgDeliveryTime"
            type="number"
            min="10"
            max="120"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="30"
            @input="e => form.avgDeliveryTime = Number((e.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <!-- Delivery Service Toggle -->
      <div class="flex items-center justify-between p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <TruckIcon class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-xs font-black text-gray-900 uppercase">Teslimat Hizmeti</p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Restoran kendi teslimatını yapar</p>
          </div>
        </div>
        <button
          type="button"
          :class="form.hasDeliveryService ? 'bg-blue-500' : 'bg-gray-300'"
          class="relative inline-flex h-7 w-12 rounded-full border-2 border-transparent transition-colors duration-300 outline-none"
          @click="form.hasDeliveryService = !form.hasDeliveryService"
        >
          <span :class="form.hasDeliveryService ? 'translate-x-5' : 'translate-x-0'" class="inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition duration-300" />
        </button>
      </div>

      <!-- Delivery Fee (only when hasDeliveryService is true) -->
      <div v-if="form.hasDeliveryService" class="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-500">
        <div class="space-y-3">
          <label class="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <BanknotesIcon class="h-4 w-4" /> Sabit Teslimat Ücreti (₺)
          </label>
          <input
            :value="form.deliveryFee"
            type="number"
            step="1"
            min="0"
            class="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="15"
            @input="e => form.deliveryFee = Number((e.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <!-- Status Toggles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircleIcon class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-xs font-black text-gray-900 uppercase">Siparişleri Kabul Et</p>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Açık olduğunda sipariş alır</p>
            </div>
          </div>
          <button
            type="button"
            :class="form.acceptingOrders ? 'bg-green-500' : 'bg-gray-300'"
            class="relative inline-flex h-7 w-12 rounded-full border-2 border-transparent transition-colors duration-300 outline-none"
            @click="form.acceptingOrders = !form.acceptingOrders"
          >
            <span :class="form.acceptingOrders ? 'translate-x-5' : 'translate-x-0'" class="inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition duration-300" />
          </button>
        </div>

        <div class="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="text-xs font-black text-gray-900 uppercase">Tatil Rejimi</p>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kapalıyken sipariş alma</p>
            </div>
          </div>
          <button
            type="button"
            :class="form.holidayMode ? 'bg-red-500' : 'bg-gray-300'"
            class="relative inline-flex h-7 w-12 rounded-full border-2 border-transparent transition-colors duration-300 outline-none"
            @click="form.holidayMode = !form.holidayMode"
          >
            <span :class="form.holidayMode ? 'translate-x-5' : 'translate-x-0'" class="inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition duration-300" />
          </button>
        </div>
      </div>

      <!-- Holiday Note -->
      <div v-if="form.holidayMode" class="p-6 bg-red-50 rounded-[2rem] border border-red-100 animate-in fade-in slide-in-from-top-4 duration-500">
        <label class="block text-[10px] font-black text-red-900 uppercase tracking-widest mb-2">Tatil Mesajı (Opsiyonel)</label>
        <input
          v-model="form.holidayMessage"
          type="text"
          class="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-sm"
          placeholder="örn: Bayram dolayısıyla 3 gün kapalıyız. Anlayışınız için teşekkürler!"
        >
      </div>
    </div>
  </div>
</template>