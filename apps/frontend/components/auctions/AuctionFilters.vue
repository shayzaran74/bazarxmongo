<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Arama</label>
        <input
          :value="searchQuery"
          type="text"
          placeholder="Açık artırma ara..."
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
        <select
          :value="selectedCategory"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @change="$emit('update:selectedCategory', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tüm Kategoriler</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
        <select
          :value="statusFilter"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Tüm Durumlar</option>
          <option value="Active">Aktif</option>
          <option value="Completed">Tamamlanmış</option>
          <option value="Cancelled">İptal Edilmiş</option>
        </select>
      </div>

      <!-- Sort -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
        <select
          :value="sortBy"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          @change="$emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
        >
          <option value="endTime_asc">Bitiş Zamanı (Yakın)</option>
          <option value="endTime_desc">Bitiş Zamanı (Uzak)</option>
          <option value="currentBid_desc">En Yüksek Teklif</option>
          <option value="created_desc">En Yeni</option>
          <option value="startPrice_asc">Başlangıç Fiyatı (Düşük)</option>
          <option value="startPrice_desc">Başlangıç Fiyatı (Yüksek)</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  searchQuery: string
  selectedCategory: string
  statusFilter: string
  sortBy: string
  categories: any[]
}>()

defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'update:selectedCategory', val: string): void
  (e: 'update:statusFilter', val: string): void
  (e: 'update:sortBy', val: string): void
}>()
</script>
