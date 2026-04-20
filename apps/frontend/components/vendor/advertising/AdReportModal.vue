<!-- apps/frontend/pages/vendor/advertising/components/AdReportModal.vue -->
<script setup lang="ts">
import { XMarkIcon, GiftIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

defineProps<{
  modelValue: boolean
  campaign: any
  coupons: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-3xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <GiftIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-black text-gray-900">Kampanya Raporu</h3>
              <p class="text-sm text-gray-500 font-medium">{{ campaign?.name }}</p>
            </div>
          </div>
          <button
            class="p-2.5 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm"
            @click="emit('update:modelValue', false)"
          >
            <XMarkIcon class="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <ArrowPathIcon class="w-10 h-10 text-indigo-600 animate-spin" />
            <p class="mt-4 text-sm font-bold text-gray-500">Rapor verileri hazırlanıyor...</p>
          </div>

          <div v-else-if="coupons.length === 0" class="text-center py-20">
            <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4">
              <GiftIcon class="w-10 h-10" />
            </div>
            <h4 class="text-lg font-bold text-gray-900">Kupon Kullanımı Bulunamadı</h4>
            <p class="text-sm text-gray-500 mt-1">Bu kampanya üzerinden henüz bir kupon kazanılmadı veya kullanılmadı.</p>
          </div>

          <div v-else class="space-y-6">
            <!-- Stats Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <span class="text-xs font-black text-gray-400 uppercase tracking-widest">TOPLAM KUPON</span>
                <p class="text-3xl font-black text-gray-900 mt-1">{{ coupons.length }}</p>
              </div>
              <div class="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                <span class="text-xs font-black text-indigo-400 uppercase tracking-widest text-indigo-600">KULLANILAN</span>
                <p class="text-3xl font-black text-indigo-700 mt-1">{{ coupons.filter(c => c.isUsed).length }}</p>
              </div>
              <div class="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                <span class="text-xs font-black text-green-400 uppercase tracking-widest text-green-600">AKTİF</span>
                <p class="text-3xl font-black text-green-700 mt-1">{{ coupons.filter(c => !c.isUsed).length }}</p>
              </div>
            </div>

            <!-- Table -->
            <div class="border border-gray-100 rounded-2xl overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase">Kupon Kodu</th>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase">Kullanıcı</th>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase">Oluşturulma</th>
                    <th class="px-6 py-4 text-xs font-black text-gray-500 uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-mono font-bold text-indigo-600">{{ coupon.code }}</td>
                    <td class="px-6 py-4 text-sm font-medium text-gray-700">{{ coupon.user?.firstName || 'Bilinmeyen' }}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(coupon.createdAt) }}</td>
                    <td class="px-6 py-4">
                      <span
                        v-if="coupon.isUsed"
                        class="px-2 py-1 text-[10px] font-black bg-gray-100 text-gray-500 rounded-lg border border-gray-200"
                      >KULLANILDI</span>
                      <span
                        v-else
                        class="px-2 py-1 text-[10px] font-black bg-green-50 text-green-600 rounded-lg border border-green-100"
                      >AKTİF</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
</style>
