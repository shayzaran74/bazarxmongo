<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          Kategoriler
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Ürünlerinizi kategorilere ayırın ve organize edin
        </p>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
      <EmptyState
        :icon="FolderIcon"
        title="Henüz kategori yok"
        description="Ürünlerinizi organize etmek için kategoriler oluşturun"
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
              Ürün Sayısı
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tag/Rozet
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
            <tr
              class="hover:bg-gray-50 bg-blue-50 cursor-pointer transition-colors"
              @click="toggleExpanded(category.id)"
            >
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="mr-2 text-gray-400">
                    <component
                      :is="expandedCategories.includes(category.id) ? HeroIcons.ChevronDownIcon : HeroIcons.ChevronRightIcon"
                      class="h-4 w-4"
                    />
                  </div>
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
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  Ana Kategori
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ category._count?.children || 0 }} alt kategori
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ category._count?.CatalogProduct || 0 }} ürün
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="category.badgeText"
                  class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                  :style="{ backgroundColor: category.badgeColor || '#ef4444' }"
                >
                  {{ category.badgeText }}
                </span>
                <span
                  v-else
                  class="text-xs text-gray-400 italic"
                >Yok</span>
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
                <NuxtLink
                  :to="`/admin/categories/${category.id}/attributes`"
                  class="text-purple-600 hover:text-purple-900 mr-4"
                >
                  Özellikler
                </NuxtLink>
                <button
                  class="text-blue-600 hover:text-blue-900 mr-4"
                  @click.stop="openEditModal(category)"
                >
                  Düzenle
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  @click.stop="deleteCategory(category.id)"
                >
                  Sil
                </button>
              </td>
            </tr>

            <!-- Alt Kategoriler (Level 1) -->
            <template v-if="expandedCategories.includes(category.id)">
              <template
                v-for="child in category.children"
                :key="child.id"
              >
                <tr
                  class="hover:bg-gray-50 border-l-4 border-blue-200 cursor-pointer transition-colors"
                  @click="toggleExpanded(child.id)"
                >
                  <td class="px-6 py-4 pl-10">
                    <div class="flex items-center">
                      <div class="mr-2 text-gray-400">
                        <component
                          :is="expandedCategories.includes(child.id) ? HeroIcons.ChevronDownIcon : HeroIcons.ChevronRightIcon"
                          v-if="child.children && child.children.length > 0"
                          class="h-4 w-4"
                        />
                        <div
                          v-else
                          class="h-4 w-4"
                        />
                      </div>
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
                    <span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Alt Kategori
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ child._count?.children || 0 }} detay kategori
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ child._count?.CatalogProduct || 0 }} ürün
                  </td>
                  <td class="px-6 py-4">
                    <span
                      v-if="child.badgeText"
                      class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      :style="{ backgroundColor: child.badgeColor || '#ef4444' }"
                    >
                      {{ child.badgeText }}
                    </span>
                    <span
                      v-else
                      class="text-xs text-gray-400 italic"
                    >Yok</span>
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
                    <NuxtLink
                      :to="`/admin/categories/${child.id}/attributes`"
                      class="text-purple-600 hover:text-purple-900 mr-4"
                    >
                      Özellikler
                    </NuxtLink>
                    <button
                      class="text-blue-600 hover:text-blue-900 mr-4"
                      @click.stop="openEditModal(child)"
                    >
                      Düzenle
                    </button>
                    <button
                      class="text-red-600 hover:text-red-900"
                      @click.stop="deleteCategory(child.id)"
                    >
                      Sil
                    </button>
                  </td>
                </tr>

                <!-- Detay Kategoriler (Level 2) -->
                <template v-if="expandedCategories.includes(child.id)">
                  <tr
                    v-for="grandChild in child.children"
                    :key="grandChild.id"
                    class="hover:bg-gray-50 bg-gray-50 border-l-8 border-gray-200"
                  >
                    <td class="px-6 py-4 pl-16">
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
                      <span class="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        Detay Kategori
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-400">
                      -
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-700">
                      {{ grandChild._count?.CatalogProduct || 0 }} ürün
                    </td>
                    <td class="px-6 py-4">
                      <span
                        v-if="grandChild.badgeText"
                        class="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                        :style="{ backgroundColor: grandChild.badgeColor || '#ef4444' }"
                      >
                        {{ grandChild.badgeText }}
                      </span>
                      <span
                        v-else
                        class="text-xs text-gray-400 italic"
                      >Yok</span>
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
                      <NuxtLink
                        :to="`/admin/categories/${grandChild.id}/attributes`"
                        class="text-purple-400 hover:text-purple-600 mr-4"
                      >
                        Özellikler
                      </NuxtLink>
                      <button
                        class="text-blue-400 hover:text-blue-600 mr-4"
                        @click.stop="openEditModal(grandChild)"
                      >
                        Düzenle
                      </button>
                      <button
                        class="text-red-400 hover:text-red-600"
                        @click.stop="deleteCategory(grandChild.id)"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                </template>
              </template>
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
            {{ editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori' }}
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">İkon (HeroIcon Adı)</label>
              <input
                v-model="categoryForm.icon"
                type="text"
                placeholder="ShoppingBagIcon"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Üst Kategori</label>
              <!-- Search Filter for Select -->
              <div class="relative mb-2">
                <input
                  v-model="categorySearch"
                  type="text"
                  placeholder="Kategori ara..."
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-gray-50 focus:bg-white transition-colors"
                >
              </div>
              <select
                v-model="categoryForm.parentId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="null">
                  Ana Kategori (En Üst Seviye)
                </option>
                <template
                  v-for="mainCat in filteredCategories"
                  :key="mainCat.id"
                >
                  <option
                    :value="mainCat.id"
                    class="font-bold"
                  >
                    {{ mainCat.icon }} {{ mainCat.name }}
                  </option>
                  <!-- Alt kategorileri de üst kategori olarak seçebilme (Trendyol 3 seviye için) -->
                  <option
                    v-for="subCat in (mainCat.children || [])"
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                v-model="categoryForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Resmi (Banner)</label>
              <div class="space-y-3">
                <!-- Preview -->
                <div
                  v-if="categoryForm.image || imagePreview"
                  class="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    :src="imagePreview || categoryForm.image"
                    class="w-full h-full object-cover"
                  >
                  <button
                    type="button"
                    class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    @click="removeImage"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>

                <!-- Input/Upload Toggle -->
                <div class="flex gap-2">
                  <input
                    v-model="categoryForm.image"
                    type="text"
                    placeholder="Görsel URL veya dosya yükleyin"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >

                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange"
                  >
                  <button
                    type="button"
                    :disabled="uploading"
                    class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors flex items-center disabled:opacity-50 border border-gray-300"
                    @click="$refs.fileInput.click()"
                  >
                    <PhotoIcon class="h-4 w-4 mr-2" />
                    {{ uploading ? 'Yükleniyor...' : 'Yükle' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Yeni Renk Alanları -->
            <div class="col-span-2 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gradient Başlangıç</label>
                <input
                  v-model="categoryForm.colorFrom"
                  type="text"
                  placeholder="from-blue-400"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gradient Bitiş</label>
                <input
                  v-model="categoryForm.colorTo"
                  type="text"
                  placeholder="to-amber-500"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Yazı Hover Rengi</label>
                <input
                  v-model="categoryForm.hoverColor"
                  type="text"
                  placeholder="group-hover:text-gray-600"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gölge Rengi</label>
                <input
                  v-model="categoryForm.shadowColor"
                  type="text"
                  placeholder="shadow-gray-200"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>

            <div class="col-span-2 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Yeni/İndirim Tagı (Rozet)</label>
                <input
                  v-model="categoryForm.badgeText"
                  type="text"
                  placeholder="YENİ veya İNDİRİM"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tag Rengi</label>
                <div class="flex items-center space-x-2">
                  <input
                    v-model="categoryForm.badgeColor"
                    type="color"
                    class="h-10 w-12 border border-blue-300 rounded bg-white p-1"
                  >
                  <input
                    v-model="categoryForm.badgeColor"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
            </div>

            <div class="col-span-2">
              <label class="flex items-center mt-2">
                <input
                  v-model="categoryForm.isActive"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
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
import * as HeroIcons from '@heroicons/vue/24/outline'
const { PlusIcon, FolderIcon, PhotoIcon, TrashIcon } = HeroIcons

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { $api } = useApi()
const categories = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingCategory = ref(null)
const categorySearch = ref('')
const uploading = ref(false)
const imagePreview = ref(null)
const categoryForm = ref({
  name: '',
  description: '',
  slug: '',
  icon: 'WalletIcon',
  image: '',
  colorFrom: 'from-blue-400',
  colorTo: 'to-amber-500',
  hoverColor: 'group-hover:text-gray-600',
  shadowColor: 'shadow-gray-200',
  parentId: null,
  order: 0,
  isActive: true,
  badgeText: '',
  badgeColor: '#ef4444'
})

// Expand/Collapse logic
const expandedCategories = ref([])

const toggleExpanded = (id) => {
  if (expandedCategories.value.includes(id)) {
    expandedCategories.value = expandedCategories.value.filter(catId => catId !== id)
  } else {
    expandedCategories.value.push(id)
  }
}

// Computed - Ana kategoriler
const mainCategories = computed(() => {
  return categories.value.filter(cat => !cat.parentId)
})

// Filtered categories for parent selection
const filteredCategories = computed(() => {
  if (!categorySearch.value) return mainCategories.value

  const search = categorySearch.value.toLowerCase()
  return mainCategories.value.filter(main => {
    // Check main category name
    const mainMatches = main.name.toLowerCase().includes(search)

    // Check if any child matches
    const childMatches = main.children?.some(child => child.name.toLowerCase().includes(search))

    return mainMatches || childMatches
  }).map(main => {
    // If main doesn't match but child does, we still show the main but could filter children too
    // For now we show the whole branch if either matches
    return main
  })
})

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await $api('/api/admin/categories', {
      query: { includeChildren: true }
    })
    categories.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loading.value = false
  }
}



// Methods
const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    useNuxtApp().$toast.error('Lütfen bir görsel dosyası seçin')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    useNuxtApp().$toast.error('Dosya boyutu 5MB\'dan küçük olmalı')
    return
  }

  uploading.value = true
  imagePreview.value = URL.createObjectURL(file)

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $api('/api/upload?type=category', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      categoryForm.value.image = response.url
      useNuxtApp().$toast.success('Görsel yüklendi')
    }
  } catch (error) {
    console.error('Upload error:', error)
    useNuxtApp().$toast.error('Görsel yüklenirken hata oluştu')
    imagePreview.value = null
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

const removeImage = () => {
  categoryForm.value.image = ''
  imagePreview.value = null
}

const openCreateModal = () => {
  editingCategory.value = null
  categorySearch.value = ''
  imagePreview.value = null
  categoryForm.value = {
    name: '',
    description: '',
    slug: '',
    icon: 'WalletIcon',
    image: '',
    colorFrom: 'from-blue-400',
    colorTo: 'to-amber-500',
    hoverColor: 'group-hover:text-gray-600',
    shadowColor: 'shadow-gray-200',
    parentId: null,
    order: 0,
    isActive: true,
    badgeText: '',
    badgeColor: '#ef4444'
  }
  showModal.value = true
}

const openEditModal = (category) => {
  editingCategory.value = category
  categorySearch.value = ''
  imagePreview.value = null
  categoryForm.value = {
    ...category,
    colorFrom: category.colorFrom || 'from-blue-400',
    colorTo: category.colorTo || 'to-amber-500',
    hoverColor: category.hoverColor || 'group-hover:text-gray-600',
    shadowColor: category.shadowColor || 'shadow-gray-200',
    icon: category.icon || 'WalletIcon'
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  categorySearch.value = ''
  imagePreview.value = null
}

// Save category
const saveCategory = async () => {
  try {

    const url = editingCategory.value
      ? `/api/admin/categories/${editingCategory.value.id}`
      : '/api/admin/categories'

    const method = editingCategory.value ? 'PUT' : 'POST'

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
    await $api(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    })

    const toast = useNuxtApp().$toast
    toast.success('Kategori silindi')
    fetchCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
    const toast = useNuxtApp().$toast
    toast.error('Kategori silinirken hata oluştu')
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
