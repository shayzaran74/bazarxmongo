<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink
        to="/admin/surplus-categories"
        class="text-blue-600 hover:text-blue-800 text-sm flex items-center mb-4"
      >
        <ChevronLeftIcon class="h-4 w-4 mr-1" />
        Barter Kategorilere Dön
      </NuxtLink>

      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ category?.name || 'Yükleniyor...' }} - Barter Özellikleri
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Bu kategoriye ait takas/barter özellikleri (Kalite, Miktar, Teknik Özellikler vb.)
          </p>
        </div>
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          @click="openCreateModal"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Özellik Ekle
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="attributes.length === 0 && !loading"
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
    >
      <TagIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        Henüz özellik yok
      </h3>
      <p class="text-gray-500 mb-4">
        Bu barter kategorisine özellik ekleyerek firmalar takas item eklerken
        doldurması gereken alanları belirleyin.
      </p>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
        @click="openCreateModal"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        İlk Özelliği Ekle
      </button>
    </div>

    <!-- Attributes List -->
    <div
      v-else-if="!loading"
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Özellik
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tip
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Seçenekler
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Ayarlar
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Durum
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="attr in attributes"
            :key="attr.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4">
              <div>
                <div class="text-sm font-medium text-gray-900">
                  {{ attr.label }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ attr.name }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-blue-100 text-blue-800': attr.type === 'select',
                  'bg-green-100 text-green-800': attr.type === 'text',
                  'bg-purple-100 text-purple-800': attr.type === 'number',
                  'bg-yellow-100 text-yellow-800': attr.type === 'checkbox',
                  'bg-pink-100 text-pink-800': attr.type === 'multiselect'
                }"
              >
                {{ typeLabels[attr.type] || attr.type }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div
                v-if="attr.options && attr.options.length > 0"
                class="flex flex-wrap gap-1"
              >
                <span
                  v-for="(opt, idx) in attr.options.slice(0, 4)"
                  :key="idx"
                  class="px-2 py-0.5 text-xs bg-gray-100 rounded"
                >
                  {{ opt }}
                </span>
                <span
                  v-if="attr.options.length > 4"
                  class="text-xs text-gray-500"
                >
                  +{{ attr.options.length - 4 }} daha
                </span>
              </div>
              <span
                v-else
                class="text-xs text-gray-400"
              >-</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span
                  v-if="attr.isRequired"
                  class="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded"
                >Zorunlu</span>
                <span
                  v-if="attr.isFilterable"
                  class="px-2 py-0.5 text-xs bg-cyan-100 text-cyan-800 rounded"
                >Filtrelenebilir</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  attr.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]"
              >
                {{ attr.isActive ? 'Aktif' : 'Pasif' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-medium">
              <button
                class="text-orange-600 hover:text-orange-900 mr-4"
                @click="openEditModal(attr)"
              >
                Düzenle
              </button>
              <button
                class="text-red-600 hover:text-red-900"
                @click="deleteAttribute(attr.id)"
              >
                Sil
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="text-center py-12"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto" />
      <p class="text-gray-500 mt-2">
        Yükleniyor...
      </p>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingAttribute ? 'Özelliği Düzenle' : 'Yeni Barter Özelliği' }}
          </h3>
        </div>
        <form
          class="px-6 py-4"
          @submit.prevent="saveAttribute"
        >
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Görünen Ad *</label>
                <input
                  v-model="attrForm.label"
                  type="text"
                  required
                  placeholder="Kalite Sınıfı, Malzeme Türü..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teknik Ad *</label>
                <input
                  v-model="attrForm.name"
                  type="text"
                  required
                  placeholder="kalite_sinifi, malzeme_turu..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tip *</label>
                <select
                  v-model="attrForm.type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="text">
                    Metin
                  </option>
                  <option value="number">
                    Sayı
                  </option>
                  <option value="select">
                    Tekli Seçim
                  </option>
                  <option value="multiselect">
                    Çoklu Seçim
                  </option>
                  <option value="checkbox">
                    Onay Kutusu
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Birim</label>
                <input
                  v-model="attrForm.unit"
                  type="text"
                  placeholder="kg, adet, metre..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
              </div>
            </div>

            <!-- Options for select/multiselect -->
            <div v-if="['select', 'multiselect'].includes(attrForm.type)">
              <label class="block text-sm font-medium text-gray-700 mb-1">Seçenekler *</label>
              <input
                v-model="optionsInput"
                type="text"
                placeholder="A, B, C veya Pamuk, Polyester..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
              <p class="text-xs text-gray-500 mt-1">
                Virgülle ayırarak yazın
              </p>
              <div
                v-if="parsedOptions.length > 0"
                class="flex flex-wrap gap-1 mt-2"
              >
                <span
                  v-for="(opt, idx) in parsedOptions"
                  :key="idx"
                  class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded"
                >
                  {{ opt }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
              <input
                v-model="attrForm.placeholder"
                type="text"
                placeholder="Form alanında görünecek ipucu..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
            </div>

            <div class="border-t border-gray-200 pt-4 space-y-3">
              <label class="flex items-center">
                <input
                  v-model="attrForm.isRequired"
                  type="checkbox"
                  class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-900">Zorunlu Alan</span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="attrForm.isFilterable"
                  type="checkbox"
                  class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-900">Filtrelenebilir</span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="attrForm.isActive"
                  type="checkbox"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-900">Aktif</span>
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="closeModal"
            >
              İptal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
            >
              {{ editingAttribute ? 'Güncelle' : 'Ekle' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, ChevronLeftIcon, TagIcon } from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const route = useRoute()
const { $api } = useApi()
const categoryId = route.params.id

const category = ref(null)
const attributes = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingAttribute = ref(null)
const optionsInput = ref('')

const typeLabels = {
    text: 'Metin',
    number: 'Sayı',
    select: 'Tekli Seçim',
    multiselect: 'Çoklu Seçim',
    checkbox: 'Onay Kutusu'
}

const defaultForm = {
    name: '',
    label: '',
    type: 'text',
    options: null,
    unit: '',
    placeholder: '',
    isRequired: false,
    isVariant: false,
    isFilterable: true,
    order: 0,
    isActive: true
}

const attrForm = ref({ ...defaultForm })

const parsedOptions = computed(() => {
    if (!optionsInput.value) return []
    return optionsInput.value.split(',').map(o => o.trim()).filter(Boolean)
})

// Fetch category info
const fetchCategory = async () => {
    try {
        const response = await $api(`/api/v1/admin/surplus-categories/${categoryId}`)
        category.value = response.data
    } catch (error) {
        console.error('Error fetching category:', error)
    }
}

// Fetch attributes
const fetchAttributes = async () => {
    loading.value = true
    try {
        const response = await $api(`/api/v1/admin/category-attributes`, {
            query: { surplusCategoryId: categoryId }
        })
        attributes.value = response.data || []
    } catch (error) {
        console.error('Error fetching attributes:', error)
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    editingAttribute.value = null
    attrForm.value = { ...defaultForm, order: attributes.value.length }
    optionsInput.value = ''
    showModal.value = true
}

const openEditModal = (attr) => {
    editingAttribute.value = attr
    attrForm.value = { ...attr }
    optionsInput.value = attr.options?.join(', ') || ''
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingAttribute.value = null
}

const saveAttribute = async () => {
    try {
        // Parse options
        if (['select', 'multiselect'].includes(attrForm.value.type)) {
            attrForm.value.options = parsedOptions.value
        } else {
            attrForm.value.options = null
        }

        const url = editingAttribute.value
            ? `/api/v1/admin/category-attributes/${editingAttribute.value.id}`
            : '/api/v1/admin/category-attributes'

        const method = editingAttribute.value ? 'PUT' : 'POST'

        const body = {
            ...attrForm.value,
            surplusCategoryId: categoryId
        }

        const response = await $api(url, {
            method,
            body
        })

        if (response.success) {
            const toast = useNuxtApp().$toast
            toast.success(editingAttribute.value ? 'Özellik güncellendi!' : 'Özellik eklendi!')
            closeModal()
            fetchAttributes()
        }
    } catch (error) {
        console.error('Error saving attribute:', error)
        const toast = useNuxtApp().$toast
        toast.error(error.data?.error || 'Özellik kaydedilirken hata oluştu')
    }
}

const deleteAttribute = async (id) => {
    if (!confirm('Bu özelliği silmek istediğinize emin misiniz?')) return

    try {
        await $api(`/api/v1/admin/category-attributes/${id}`, {
            method: 'DELETE'
        })

        const toast = useNuxtApp().$toast
        toast.success('Özellik silindi')
        fetchAttributes()
    } catch (error) {
        console.error('Error deleting attribute:', error)
        const toast = useNuxtApp().$toast
        toast.error('Özellik silinirken hata oluştu')
    }
}

onMounted(() => {
    fetchCategory()
    fetchAttributes()
})
</script>
