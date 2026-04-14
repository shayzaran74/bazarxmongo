<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Segmentler
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Müşterilerinizi segmentlere ayırın ve hedefleyin
        </p>
      </div>
      <a
        href="/admin/segment-form"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Segment oluştur
      </a>
    </div>

    <!-- Segments List -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Segment ara"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
      </div>

      <!-- Default Segments -->
      <div class="divide-y divide-gray-200">
        <div
          v-for="segment in defaultSegments"
          :key="segment.name"
          class="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
        >
          <div class="flex items-center flex-1">
            <input
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <div class="ml-3 flex-1">
              <div class="text-sm font-medium text-gray-900">
                {{ segment.name }}
              </div>
              <div class="text-sm text-gray-500">
                Müşterilerin %{{ segment.percentage }}
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              {{ segment.count }} üye
            </div>
            <div class="text-sm text-gray-400">
              {{ segment.created }}
            </div>
            <button class="text-gray-400 hover:text-gray-600">
              <EllipsisVerticalIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="defaultSegments.length === 0"
        class="p-8 text-center text-gray-500"
      >
        Henüz segment oluşturulmadı
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const searchQuery = ref('')

// Demo segments (Shopify görselindeki gibi)
const defaultSegments = ref([
  {
    name: 'Ad',
    percentage: '0',
    count: 0,
    created: '15-24 saattir oluşturuldu'
  },
  {
    name: 'En az bir kere satın alma yapan müşteriler',
    percentage: '0',
    count: 0,
    created: '15-24 saattir oluşturuldu'
  },
  {
    name: 'E-posta aboneleri',
    percentage: '0',
    count: 0,
    created: '15-24 saattir oluşturuldu'
  },
  {
    name: 'Son 30 günde alışveriş yapmayanlar',
    percentage: '0',
    count: 0,
    created: '15-24 saattir oluşturuldu'
  },
  {
    name: 'Bir kereden fazla satın alan yapan müşteriler',
    percentage: '0',
    count: 0,
    created: '15-24 saattir oluşturuldu'
  },
  {
    name: 'Satın alım yapanların müşteriler',
    percentage: '0',
    count: 0,
    created: '15-24 saattir oluşturuldu'
  }
])
</script>
