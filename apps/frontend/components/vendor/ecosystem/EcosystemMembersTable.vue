<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <h3 class="text-xl font-black text-gray-900 flex items-center gap-2 italic uppercase">
        <UsersIcon class="h-6 w-6 text-indigo-500" />
        Üye Bayiler ({{ members.length }})
      </h3>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-sm" @click="$emit('invite')">
        Üye Ekle
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50/30 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-50">
          <tr>
            <th class="px-6 py-4">Bayi / Şirket</th>
            <th class="px-6 py-4">Durum</th>
            <th class="px-6 py-4">Güven Puanı</th>
            <th class="px-6 py-4 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 uppercase italic">
          <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-5">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center font-black text-indigo-500 text-xs">
                  {{ member.businessName?.charAt(0) || 'B' }}
                </div>
                <div class="flex flex-col">
                  <span class="font-black text-gray-900 text-sm">{{ member.businessName }}</span>
                  <span class="text-[9px] text-gray-400 font-bold tabular-nums">PUAN: {{ member.trustScore || 100 }}</span>
                </div>
              </div>
            </td>
            <td class="px-6 py-5">
              <span :class="['px-3 py-1 rounded-full text-[9px] font-black', member.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700']">
                {{ member.status === 'APPROVED' ? 'ONAYLI' : member.status }}
              </span>
            </td>
            <td class="px-6 py-5">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-100 h-1.5 w-20 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-1000" :style="{ width: `${member.trustScore}%` }" :class="member.trustScore > 70 ? 'bg-green-500' : 'bg-orange-500'" />
                </div>
              </div>
            </td>
            <td class="px-6 py-5 text-right">
              <button class="text-gray-300 hover:text-red-500 transition-colors p-2" @click="$emit('remove', member.id)">
                <TrashIcon class="h-5 w-5" />
              </button>
            </td>
          </tr>
          <tr v-if="!members.length">
            <td colspan="4" class="px-6 py-12 text-center text-gray-400 italic font-black uppercase text-xs">
              Henüz ekosisteme kayıtlı bayi bulunmuyor.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { UsersIcon, TrashIcon } from '@heroicons/vue/24/outline'
defineProps({ members: Array })
defineEmits(['invite', 'remove'])
</script>
