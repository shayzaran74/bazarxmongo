<template>
  <div class="bg-gray-50 rounded-[40px] p-8 lg:p-12 border border-gray-100 mb-8 relative overflow-hidden group">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
      <!-- Left: Status Display & Actions -->
      <div class="space-y-8">
        <div class="flex items-start gap-6">
          <div class="p-5 bg-white rounded-[24px] shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-500">
            <component :is="statusStyle.icon" class="h-10 w-10 text-indigo-600" />
          </div>
          <div>
            <h3 class="text-2xl font-black text-gray-900 uppercase italic leading-none mb-3 tracking-tight">
              {{ statusStyle.label }}
            </h3>
            <p class="text-sm text-gray-500 font-bold leading-relaxed opacity-80">
              {{ statusStyle.description }}
            </p>
          </div>
        </div>

        <div class="pt-8 border-t border-gray-200">
          <!-- Pending Collateral -->
          <div v-if="statusKey === 'PENDING_COLLATERAL'" class="space-y-4">
            <div class="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <span class="text-amber-600 mt-0.5 flex-shrink-0">🔒</span>
              <div>
                <p class="font-medium text-amber-800">Teminat otomatik bloke edildi</p>
                <p class="text-amber-700 text-xs mt-0.5">
                  Teklif kabul edildiğinde her iki tarafın teminatı (toplam değerin %20'si)
                  cüzdanınızdan otomatik olarak ayrıldı. Takas tamamlanınca serbest bırakılır.
                </p>
              </div>
            </div>
            <div v-if="isMyCollateralLocked" class="flex items-center gap-3 text-green-600 bg-green-50 p-5 rounded-2xl border border-green-100">
              <CheckCircleIcon class="h-6 w-6" />
              <span class="text-[10px] font-black uppercase tracking-[0.2em]">Teminatınız Kilitlendi. Karşı taraf bekleniyor.</span>
            </div>
          </div>

          <!-- Shipping -->
          <div v-else-if="isShippingPhase" class="space-y-5">
            <!-- DIGITAL mod bilgi bandı -->
            <div v-if="statusStyle.digitalMode" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm font-medium text-blue-900">Dijital Teslimat</p>
              <p class="text-xs text-blue-700 mt-1">
                Bu takas dijital ürün içeriyor. Dosya/erişim bilgisini karşı tarafa sohbet üzerinden iletmeniz yeterli.
                Teslim 24 saat içinde otomatik olarak onaylanacak.
              </p>
            </div>
            <div v-else-if="!isMyShippingInfoProvided" class="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">Kargo Takip No / Teslimat Bilgisi</label>
              <div class="flex flex-col gap-4">
                <input 
                  :value="shippingCode"
                  type="text" 
                  placeholder="Örn: MNG-123456" 
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner outline-none"
                  @input="$emit('update:shippingCode', $event.target.value)"
                >
                <button 
                  :disabled="!shippingCode || actionLoading"
                  class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg shadow-indigo-100"
                  @click="$emit('submit-shipping')"
                >GÖNDERİMİ BİLDİR</button>
              </div>
            </div>
            <div v-else class="space-y-4">
              <div class="flex items-center gap-3 text-indigo-600 bg-white p-5 rounded-2xl border border-indigo-100">
                <TruckIcon class="h-6 w-6" />
                <span class="text-[10px] font-black uppercase tracking-widest leading-none">Gönderim Kaydedildi: <span class="italic">{{ myShippingCode }}</span></span>
              </div>
              <button 
                v-if="!isMyReceiptConfirmed"
                :disabled="actionLoading"
                class="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all transform active:scale-95"
                @click="$emit('confirm-receipt')"
              >ÜRÜNÜ TESLİM ALDIM</button>
            </div>
          </div>

          <!-- Inspection -->
          <div v-else-if="isInspectionPhase" class="space-y-6">
            <div class="bg-amber-50 p-8 rounded-[32px] border border-amber-100 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <span class="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">İnceleme Süresi</span>
                <span class="text-2xl font-black text-amber-700 tracking-tighter tabular-nums">{{ timeLeft }}</span>
              </div>
              <div class="flex flex-col gap-4">
                <button 
                  v-if="!isMyReceiptConfirmed"
                  :disabled="actionLoading"
                  class="w-full bg-amber-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-700 transition-all"
                  @click="$emit('confirm-receipt')"
                >ÜRÜNÜ TESLİM ALDIM</button>
                
                <div class="flex gap-4">
                  <button class="flex-1 py-4 bg-white border border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all" @click="$emit('dispute')">SORUN BİLDİR</button>
                  <button v-if="!isMyFinalized" :disabled="!isMyReceiptConfirmed" class="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 disabled:opacity-30 transition-all" @click="$emit('finalize')">ONAYLA & TAMAMLA</button>
                  <div v-else class="flex-1 bg-green-100 text-green-700 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                    <CheckCircleIcon class="w-4 h-4" /> ONAY ALINDI
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Completed -->
          <div v-else-if="isCompletedPhase" class="text-center py-4">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShieldCheckIcon class="h-10 w-10 text-green-600" />
            </div>
            <h4 class="text-xl font-black text-gray-900 uppercase italic mb-6">Takas Başarıyla Tamamlandı</h4>
            <button class="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 mx-auto group" @click="$emit('review')">
              <StarIcon class="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
              SÜRECİ DEĞERLENDİR
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Summary (Items/Companies) -->
      <slot name="summary" />
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon, TruckIcon, LockClosedIcon, ShieldCheckIcon, StarIcon } from '@heroicons/vue/24/outline'

defineProps({
  statusKey: String,
  statusStyle: Object,
  isMyCollateralLocked: Boolean,
  isMyShippingInfoProvided: Boolean,
  isMyReceiptConfirmed: Boolean,
  isMyFinalized: Boolean,
  shippingCode: String,
  myShippingCode: String,
  actionLoading: Boolean,
  timeLeft: String,
  isShippingPhase: Boolean,
  isInspectionPhase: Boolean,
  isCompletedPhase: Boolean
})

defineEmits(['submit-shipping', 'confirm-receipt', 'finalize', 'dispute', 'review', 'update:shippingCode'])
</script>
