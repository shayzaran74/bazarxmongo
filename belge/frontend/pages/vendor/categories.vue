<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Kategoriler
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Sistemde tanımlı olan ürün kategorilerini inceleyin
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="categories.length === 0 && !loading"
      class="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <EmptyState
        :icon="FolderIcon"
        title="Kategori bulunamadı"
        description="Şu an için listelenecek kategori bulunmuyor."
      />
    </div>

    <!-- Categories Table -->
    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Kategori
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tür
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Alt Kategoriler
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ürün Sayısı
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Durum
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <!-- Ana Kategoriler -->
          <template
            v-for="category in mainCategories"
            :key="category.id"
          >
            <tr class="hover:bg-gray-50 bg-blue-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="mr-3 text-blue-600">
                    <component
                      :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon"
                      class="h-6 w-6"
                    />
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900">
                      {{ category.name }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ category.slug }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  Ana Kategori
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ category._count?.children || 0 }} alt kategori
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ category._count?.products || 0 }} ürün
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ category.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
            </tr>

            <!-- Alt Kategoriler -->
            <tr
              v-for="child in category.children"
              :key="child.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 pl-12">
                <div class="flex items-center">
                  <div class="mr-2 text-blue-400">
                    <component
                      :is="HeroIcons[child.icon] || HeroIcons.FolderIcon"
                      class="h-5 w-5"
                    />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ child.name }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ child.slug }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Alt Kategori
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                -
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ child._count?.products || 0 }} ürün
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    child.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ child.isActive ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import * as HeroIcons from '@heroicons/vue/24/outline'
const { FolderIcon } = HeroIcons

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const categories = ref([])
const loading = ref(false)

// Computed - Ana kategoriler
const mainCategories = computed(() => {
  return categories.value.filter(cat => !cat.parentId)
})

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    // Admin API yerine Public API kullanılıyor (Güvenlik Düzeltmesi)
    const response = await $api('/api/categories?includeChildren=true&parentId=null')
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
