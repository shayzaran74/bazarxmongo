<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Ticari Takas Kategorileri
      </h2>
      <button
        class="btn-primary space-x-2"
        @click="openModal()"
      >
        <PlusIcon class="h-5 w-5" />
        <span>YENİ KATEGORİ</span>
      </button>
    </div>

    <!-- Category Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori Adı
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="category in categories"
            :key="category.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ category.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ category.isActive ? 'Aktif' : 'Pasif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink
                :to="`/admin/surplus-categories/${category.id}/attributes`"
                class="text-orange-600 hover:text-orange-900 mr-4"
              >
                Özellikler
              </NuxtLink>
              <button
                class="text-blue-600 hover:text-blue-900 mr-4"
                @click="openModal(category)"
              >
                Düzenle
              </button>
              <button
                class="text-red-600 hover:text-red-900"
                @click="deleteCategory(category.id)"
              >
                Sil
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="closeModal"
        />

        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >&#8203;</span>

        <div
          class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
        >
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3
                id="modal-title"
                class="text-lg leading-6 font-medium text-gray-900"
              >
                {{ editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle' }}
              </h3>
              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Kategori Adı</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                </div>
                <div
                  v-if="editingCategory"
                  class="flex items-center"
                >
                  <input
                    v-model="formData.isActive"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  >
                  <label class="ml-2 block text-sm text-gray-900">Aktif</label>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="saveCategory"
            >
              Kaydet
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
              @click="closeModal"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon } from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin', middleware: 'admin'
})

const { $api } = useApi()
const categories = ref([])
const showModal = ref(false)
const editingCategory = ref(null)
const formData = ref({
    name: '',
    isActive: true
})

const fetchCategories = async () => {
    try {
        const response = await $api('/api/admin/surplus-categories')
        if (response.success) {
            categories.value = response.categories
        }
    } catch (error) {
        console.error('Fetch error:', error)
    }
}

const openModal = (category = null) => {
    editingCategory.value = category
    if (category) {
        formData.value = {
            name: category.name,
            isActive: category.isActive
        }
    } else {
        formData.value = {
            name: '',
            isActive: true
        }
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingCategory.value = null
    formData.value = { name: '', isActive: true }
}

const saveCategory = async () => {
    if (!formData.value.name) return

    try {
        const url = editingCategory.value
            ? `/api/admin/surplus-categories/${editingCategory.value.id}`
            : '/api/admin/surplus-categories'

        const method = editingCategory.value ? 'PATCH' : 'POST'

        const response = await $api(url, {
            method,
            body: formData.value
        })

        if (response.success) {
            closeModal()
            fetchCategories()
            useNuxtApp().$toast.success(editingCategory.value ? 'Kategori güncellendi' : 'Kategori eklendi')
        }
    } catch (error) {
        console.error('Save error:', error)
        useNuxtApp().$toast.error('Kategori kaydedilirken hata oluştu')
    }
}

const deleteCategory = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return

    try {
        await $api(`/api/admin/surplus-categories/${id}`, {
            method: 'DELETE'
        })

        fetchCategories()
        useNuxtApp().$toast.success('Kategori silindi')
    } catch (error) {
        console.error('Delete error:', error)
        useNuxtApp().$toast.error('Kategori silinirken hata oluştu')
    }
}

onMounted(() => {
    fetchCategories()
})
</script>
