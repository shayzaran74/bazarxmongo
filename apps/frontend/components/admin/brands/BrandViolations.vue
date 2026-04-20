<template>
  <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
    <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest italic">Aktif Marka İhlalleri</h3>
      <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marka</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bildiren</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Şiddet</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="v in violations" :key="v.id" class="hover:bg-rose-50/30 transition-colors group">
            <td class="px-8 py-5">
              <div class="text-sm font-black text-gray-900">{{ v.brand?.name || 'Bilinmeyen' }}</div>
              <div class="text-[10px] font-bold text-gray-400">{{ v.type }}</div>
            </td>
            <td class="px-8 py-5 text-xs font-bold text-gray-700">{{ v.reporter?.businessName || 'Kullanıcı' }}</td>
            <td class="px-8 py-5 text-center">
              <span :class="getSeverityClass(v.severity)" class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">{{ v.severity }}</span>
            </td>
            <td class="px-8 py-5 text-center">
              <span :class="v.status === 'RESOLVED' ? 'text-green-600' : 'text-rose-600'" class="text-[10px] font-black uppercase tracking-widest">
                {{ v.status === 'RESOLVED' ? 'ÇÖZÜLDÜ' : 'BEKLİYOR' }}
              </span>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex items-center justify-end gap-2">
                <button class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all" @click="$emit('review', v)">
                  <ShieldExclamationIcon class="w-5 h-5" />
                </button>
                <button v-if="v.status !== 'RESOLVED'" class="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all" @click="$emit('resolve-quick', v)">
                  <CheckIcon class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!violations?.length">
            <td colspan="5" class="py-20 text-center italic text-gray-400 font-bold">Aktif ihlal bildirimi bulunmuyor.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ShieldExclamationIcon, CheckIcon } from '@heroicons/vue/24/outline'

defineProps({ violations: Array, loading: Boolean })
defineEmits(['review', 'resolve-quick'])

const getSeverityClass = (s) => ({
  HIGH: 'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-orange-100 text-orange-700 border border-orange-200',
  LOW: 'bg-blue-100 text-blue-700 border border-blue-200'
})[s] || 'bg-gray-100 text-gray-700'
</script>
