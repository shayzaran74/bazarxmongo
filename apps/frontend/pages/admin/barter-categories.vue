<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Barter Kategorileri
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Barter/Takas ürünlerini kategorilere ayırın ve organize edin
        </p>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        @click="openCreateModal"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Kategori Ekle
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="categories.length === 0 && !loading"
      class="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <CommonEmptyState
        :icon="FolderIcon"
        title="Henüz barter kategorisi yok"
        description="Takas ürünlerinizi organize etmek için kategoriler oluşturun"
        action-text="Kategori Ekle"
        @action="openCreateModal"
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
              Durum
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <!-- Ana Kategoriler -->
          <template
            v-for="category in mainCategories"
            :key="category.id"
          >
            <tr class="hover:bg-gray-50 bg-indigo-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="mr-3 text-indigo-600">
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
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"
                >
                  Ana Kategori
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ category.children?.length || 0 }} alt kategori
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
              <td class="px-6 py-4 text-right text-sm font-medium">
                <button
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                  @click="openEditModal(category)"
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

            <!-- Alt Kategoriler (Level 1) -->
            <template
              v-for="child in category.children"
              :key="child.id"
            >
              <tr class="hover:bg-gray-50 border-l-4 border-indigo-200">
                <td class="px-6 py-4 pl-12">
                  <div class="flex items-center">
                    <div class="mr-2 text-indigo-400">
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
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    Alt Kategori
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ child.children?.length || 0 }} detay kategori
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
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    class="text-indigo-600 hover:text-indigo-900 mr-4"
                    @click="openEditModal(child)"
                  >
                    Düzenle
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    @click="deleteCategory(child.id)"
                  >
                    Sil
                  </button>
                </td>
              </tr>

              <!-- Detay Kategoriler (Level 2) -->
              <tr
                v-for="grandChild in child.children"
                :key="grandChild.id"
                class="hover:bg-gray-50 bg-gray-50 border-l-8 border-gray-200"
              >
                <td class="px-6 py-4 pl-20">
                  <div class="flex items-center">
                    <span class="text-base mr-2">↳</span>
                    <div>
                      <div class="text-sm text-gray-700">
                        {{ grandChild.name }}
                      </div>
                      <div class="text-xs text-gray-400">
                        {{ grandChild.slug }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600"
                  >
                    Detay Kategori
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-400">
                  -
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                      grandChild.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ grandChild.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm font-medium">
                  <button
                    class="text-indigo-400 hover:text-indigo-600 mr-4"
                    @click="openEditModal(grandChild)"
                  >
                    Düzenle
                  </button>
                  <button
                    class="text-red-400 hover:text-red-600"
                    @click="deleteCategory(grandChild.id)"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Barter Kategorisi' }}
          </h3>
        </div>
        <form
          class="px-6 py-4"
          @submit.prevent="saveCategory"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Adı *</label>
              <input
                v-model="categoryForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">İkon (HeroIcon Adı)</label>
              <input
                v-model="categoryForm.icon"
                type="text"
                placeholder="ShoppingBagIcon"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
              <p class="text-xs text-gray-500 mt-1">
                Örn: ShoppingBagIcon, SparklesIcon, FireIcon
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
              <input
                v-model.number="categoryForm.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Üst Kategori</label>
              <select
                v-model="categoryForm.parentId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option :value="null">
                  Ana Kategori (En Üst Seviye)
                </option>
                <template
                  v-for="mainCat in mainCategories"
                  :key="mainCat.id"
                >
                  <option
                    :value="mainCat.id"
                    class="font-bold"
                  >
                    {{ mainCat.icon }} {{ mainCat.name }}
                  </option>
                  <!-- Alt kategorileri de üst kategori olarak seçebilme (3 seviye için) -->
                  <option
                    v-for="subCat in mainCat.children"
                    :key="subCat.id"
                    :value="subCat.id"
                    class="pl-4 italic"
                  >
                    &nbsp;&nbsp;↳ {{ subCat.name }}
                  </option>
                </template>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                Hiyerarşideki yerini belirleyin (Ana, Alt veya Detay)
              </p>
            </div>

            <div class="col-span-2">
              <label class="flex items-center mt-2">
                <input
                  v-model="categoryForm.isActive"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-900">Kategori Aktif</span>
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
              class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              {{ editingCategory ? 'Güncelle' : 'Ekle' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as HeroIcons from '@heroicons/vue/24/outline'
const { PlusIcon, FolderIcon } = HeroIcons

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { $api } = useApi()
const categories = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingCategory = ref(null)
const categoryForm = ref({
    name: '',
    slug: '',
    icon: '',
    parentId: null,
    order: 0,
    isActive: true
})

// Computed - Ana kategoriler
const mainCategories = computed(() => {
    return categories.value.filter(cat => !cat.parentId)
})

// Fetch categories
const fetchCategories = async () => {
    loading.value = true
    try {
        const response = await $api('/api/v1/admin/barter/surplus-categories?includeChildren=true')
        categories.value = response.categories
    } catch (error) {
        console.error('Error fetching categories:', error)
    } finally {
        loading.value = false
    }
}

// Open modal
const openCreateModal = () => {
    editingCategory.value = null
    categoryForm.value = {
        name: '',
        slug: '',
        icon: '',
        parentId: null,
        order: 0,
        isActive: true
    }
    showModal.value = true
}

const openEditModal = (category) => {
    editingCategory.value = category
    categoryForm.value = { ...category }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingCategory.value = null
}

// Save category
const saveCategory = async () => {
    try {
        const url = editingCategory.value
            ? `/api/v1/admin/barter/surplus-categories/${editingCategory.value.id}`
            : '/api/v1/admin/barter/surplus-categories'

        const method = editingCategory.value ? 'PATCH' : 'POST'

        const response = await $api(url, {
            method,
            body: categoryForm.value
        })

        if (response.success) {
            const toast = useNuxtApp().$toast
            toast.success(editingCategory.value ? 'Kategori güncellendi!' : 'Kategori eklendi!')
            closeModal()
            fetchCategories()
        }
    } catch (error) {
        console.error('Error saving category:', error)
        const toast = useNuxtApp().$toast
        const errorMessage = error.data?.error || 'Kategori kaydedilirken hata oluştu'
        toast.error(errorMessage)
    }
}

// Delete category
const deleteCategory = async (id) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return

    try {
        await $api(`/api/v1/admin/barter/surplus-categories/${id}`, {
            method: 'DELETE'
        })

        const toast = useNuxtApp().$toast
        toast.success('Kategori silindi')
        fetchCategories()
    } catch (error) {
        console.error('Error deleting category:', error)
        const toast = useNuxtApp().$toast
        toast.error(error.data?.error || 'Kategori silinirken hata oluştu')
    }
}

onMounted(() => {
    fetchCategories()
})
</script>
