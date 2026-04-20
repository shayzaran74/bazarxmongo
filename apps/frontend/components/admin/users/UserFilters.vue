<template>
  <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 mb-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-1">
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Arama</label>
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="İsim, email ara..."
            class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold"
            @input="$emit('search')"
          >
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Durum</label>
        <select v-model="filters.status" class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold appearance-none" @change="$emit('change')">
          <option value="">Tüm Durumlar</option>
          <option value="Active">Aktif</option>
          <option value="Inactive">Pasif</option>
          <option value="Suspended">Askıda</option>
          <option value="Banned">Banlı</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Rol</label>
        <select v-model="filters.role" class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold appearance-none" @change="$emit('change')">
          <option value="">Tüm Roller</option>
          <option value="admin">Admin</option>
          <option value="vendor">Satıcı</option>
          <option value="user">Müşteri</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Satıcı Durumu</label>
        <select v-model="filters.vendorStatus" class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold appearance-none" @change="$emit('change')">
          <option value="">Tümü</option>
          <option value="PENDING">Onay Bekliyor</option>
          <option value="APPROVED">Onaylı</option>
          <option value="REJECTED">Reddedilmiş</option>
        </select>
      </div>

      <div>
        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Sıralama</label>
        <select v-model="filters.sortBy" class="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold appearance-none" @change="$emit('change')">
          <option value="created_desc">Yeni Kayıtlar</option>
          <option value="created_asc">Eski Kayıtlar</option>
          <option value="name_asc">İsim (A-Z)</option>
          <option value="lastLogin_desc">Son Giriş</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  filters: Object
})

defineEmits(['change', 'search'])
</script>
