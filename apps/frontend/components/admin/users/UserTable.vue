<template>
  <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50/50 border-b border-gray-100">
          <tr>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kullanıcı</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rol</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Satıcı Statüsü</th>
            <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="user in users" :key="user.id" class="hover:bg-indigo-50/30 transition-colors group">
            <td class="px-8 py-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                  <img v-if="getUserAvatar(user)" :src="getUserAvatar(user)" class="w-full h-full object-cover">
                  <span v-else class="text-sm font-black text-gray-400 uppercase">{{ user.email?.charAt(0) }}</span>
                </div>
                <div>
                  <div class="text-sm font-black text-gray-900 group-hover:text-indigo-700 transition-colors">{{ getUserFullName(user) }}</div>
                  <div class="text-[11px] font-bold text-gray-400">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-8 py-4 text-center">
              <span :class="getStatusClass(user.status)" class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {{ user.status }}
              </span>
            </td>
            <td class="px-8 py-4 text-center">
              <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
                {{ user.computedRole }}
              </span>
            </td>
            <td class="px-8 py-4 text-center">
              <div v-if="user.vendor" class="flex flex-col items-center gap-1">
                <span :class="getVendorStatusClass(user.vendor.status)" class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {{ user.vendor.status }}
                </span>
                <span class="text-[9px] font-bold text-gray-400 italic">{{ user.vendor.businessName }}</span>
              </div>
              <span v-else class="text-gray-300 text-[10px] font-black">—</span>
            </td>
            <td class="px-8 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button v-if="user.vendor?.status === 'PENDING'" class="px-4 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl hover:bg-gray-900 transition-all shadow-sm" @click="$emit('approve-vendor', user)">ONAY BEKLİYOR</button>
                <button class="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm" @click="$emit('edit', user)">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button class="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm" @click="$emit('delete', user)">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
      <span class="text-[11px] font-black text-gray-400 uppercase tracking-widest">TOPLAM {{ pagination.total }} KAYIT</span>
      <div class="flex items-center gap-1">
        <button
          v-for="p in visiblePages" :key="p"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all"
          :class="pagination.page === p ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-white border border-transparent hover:border-gray-100'"
          @click="$emit('change-page', p)"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  users: Array,
  pagination: Object,
  visiblePages: Array
})

defineEmits(['edit', 'delete', 'change-page', 'approve-vendor'])

const getUserFullName = (user) => (user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : user.name || 'İsimsiz')
const getUserAvatar = (user) => (user.profile?.avatar || user.avatar)

const getStatusClass = (s) => ({
  'ACTIVE': 'bg-green-50 text-green-700 border border-green-100',
  'INACTIVE': 'bg-gray-100 text-gray-700 border border-gray-200',
  'BANNED': 'bg-red-50 text-red-700 border border-red-100'
})[String(s).toUpperCase()] || 'bg-gray-100 text-gray-700'

const getVendorStatusClass = (s) => ({
  'APPROVED': 'bg-green-100 text-green-700',
  'PENDING': 'bg-amber-100 text-amber-700',
  'REJECTED': 'bg-red-100 text-red-700'
})[String(s).toUpperCase()] || 'bg-gray-100 text-gray-700'
</script>
