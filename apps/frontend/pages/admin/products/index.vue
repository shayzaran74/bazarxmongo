<template>
  <div class="min-h-screen bg-gray-50/50 pb-20">
    <!-- Header Section -->
    <AdminHeader 
      title="Ürün Yönetimi" 
      subtitle="Katalog, stok ve fiyat yönetimi merkezi"
      :stats="[
        { label: 'Toplam Ürün', value: productStats.total, icon: 'CubeIcon', color: 'blue' },
        { label: 'Onaylı Ürün', value: productStats.active, icon: 'CheckBadgeIcon', color: 'green' },
        { label: 'Onay Bekleyen', value: productStats.pending, icon: 'ClockIcon', color: 'orange' }
      ]"
    >
      <template #actions>
        <div class="flex items-center space-x-3">
          <NuxtLink
            to="/admin/products/pending"
            class="bg-amber-100 text-amber-700 px-6 py-2.5 rounded-xl hover:bg-amber-200 transition-all font-black uppercase tracking-widest text-[10px] flex items-center group shadow-lg shadow-amber-500/10"
          >
            <ClockIcon class="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
            ONAY BEKLEYENLER
          </NuxtLink>
          <button 
            v-if="!showForm"
            class="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/30 flex items-center group" 
            @click="showForm = true; resetForm()"
          >
            <PlusIcon class="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            YENİ ÜRÜN EKLE
          </button>
        </div>
      </template>
    </AdminHeader>

    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Admin Product Filter -->
      <AdminProductFilter 
        v-if="!showForm"
        v-model:search="searchQuery"
        v-model:category-id="selectedFilterCategoryId"
        v-model:vendor-id="selectedFilterVendorId"
        v-model:vendor-products-only="showVendorProducts"
        v-model:pending-only="showPendingProducts"
        :categories="categories"
        :vendors="vendors"
        @filter="fetchProducts(1)"
      />

      <!-- Bulk Actions Bar -->
      <div
        v-if="selectedProductIds.length > 0 && !showForm" 
        class="bg-white border-2 border-primary-100 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-xl shadow-primary-500/5 animate-in slide-in-from-top duration-300"
      >
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
            {{ selectedProductIds.length }}
          </div>
          <div>
            <p class="text-xs font-black uppercase text-gray-900 tracking-widest">
              Öğe Seçildi
            </p>
            <p class="text-[10px] text-gray-400 font-bold uppercase">
              Toplu işlem yapabilirsiniz
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            v-if="showPendingProducts"
            :disabled="bulkProcessing"
            class="px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50"
            @click="bulkApprove"
          >
            {{ bulkProcessing ? 'BEKLEYİN...' : 'TOPLU ONAYLA' }}
          </button>
          <button
            :disabled="bulkProcessing"
            class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
            @click="showBulkEditModal = true"
          >
            TOPLU DÜZENLE
          </button>
          <button
            :disabled="bulkProcessing"
            class="px-5 py-2.5 bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-all disabled:opacity-50"
            @click="bulkDelete"
          >
            {{ bulkProcessing ? 'SİLİNİYOR...' : 'TOPLU SİL' }}
          </button>
          <div class="h-8 w-px bg-gray-200 mx-2" />
          <button
            class="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
            @click="selectedProductIds = []"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Main Product Form -->
      <transition 
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <AdminProductForm 
          v-if="showForm"
          v-model:form="formData"
          :brands="brands"
          :editing-id="editingId"
          :loading="loading"
          @submit="submitForm"
          @cancel="showForm = false; resetForm()"
        >
          <template #category-selector>
            <select 
              v-model="selectedMainCategory" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
              @change="handleMainCategoryChange"
            >
              <option value="">
                Ana Kategori Seçin
              </option>
              <option
                v-for="cat in mainCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
            
            <select 
              v-if="selectedMainCategory && subCategories1.length > 0" 
              v-model="selectedSubCategory1" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
              @change="handleSubCategory1Change"
            >
              <option value="">
                Alt Kategori Seçin
              </option>
              <option
                v-for="cat in subCategories1"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>

            <select 
              v-if="selectedSubCategory1 && subCategories2.length > 0" 
              v-model="selectedSubCategory2" 
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm font-medium"
              @change="handleSubCategory2Change"
            >
              <option value="">
                Detay Kategori Seçin
              </option>
              <option
                v-for="cat in subCategories2"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </template>

          <template #image-upload>
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div
                v-for="(img, index) in formData.productImages"
                :key="index"
                class="relative aspect-square rounded-2xl overflow-hidden group border-2 border-gray-100"
              >
                <img
                  :src="resolveImageUrl(img)"
                  class="w-full h-full object-cover"
                >
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    class="text-[8px] font-black text-white bg-primary-600 px-2 py-1 rounded-full"
                    @click="setAsMain(index)"
                  >
                    ANA GÖRSEL
                  </button>
                  <button
                    type="button"
                    class="text-[8px] font-black text-white bg-red-600 px-2 py-1 rounded-full"
                    @click="removeImage(index)"
                  >
                    SİL
                  </button>
                </div>
                <div
                  v-if="index === 0"
                  class="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-[8px] font-black rounded-lg"
                >
                  ANA GÖRSEL
                </div>
              </div>
              <label
                v-if="formData.productImages?.length < 5"
                class="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all overflow-hidden group"
              >
                <input
                  type="file"
                  class="hidden"
                  multiple
                  accept="image/*"
                  @change="handleFileUpload"
                >
                <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-100 transition-colors">
                  <CloudArrowUpIcon class="h-6 w-6 text-gray-400 group-hover:text-primary-600" />
                </div>
                <p class="text-[9px] font-black text-gray-400 uppercase group-hover:text-primary-600">Görsel Yükle</p>
                <p class="text-[7px] text-gray-300 font-bold uppercase mt-1">Sınır: 5MB</p>
              </label>
            </div>
            <div class="mt-4 flex gap-2">
              <input
                v-model="newImageUrl"
                type="text"
                placeholder="Görsel URL'si ile ekle..."
                class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              >
              <button
                type="button"
                class="px-4 py-2 bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase"
                @click="addImageUrl"
              >
                EKLE
              </button>
            </div>
          </template>

          <template #variants>
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center">
                <span class="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">4</span>
                🎨 Varyasyon Yönetimi
              </h3>
              <div class="flex items-center">
                <input
                  id="has-variants"
                  v-model="formData.hasVariants"
                  type="checkbox"
                  class="w-4 h-4 text-orange-600 rounded bg-gray-100 border-gray-300 focus:ring-orange-500"
                >
                <label
                  for="has-variants"
                  class="ml-2 text-xs font-black text-gray-700 uppercase cursor-pointer"
                >Ürün Varyasyonlu mu?</label>
              </div>
            </div>

            <div
              v-if="formData.hasVariants"
              class="space-y-6"
            >
              <div
                v-for="(opt, oIdx) in variationOptions"
                :key="oIdx"
                class="p-6 bg-orange-50/30 rounded-2xl border border-orange-100 relative"
              >
                <button
                  v-if="variationOptions.length > 1"
                  class="absolute top-4 right-4 text-orange-400 hover:text-orange-600"
                  @click="variationOptions.splice(oIdx, 1)"
                >
                  ✕
                </button>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-black text-orange-600 uppercase mb-1.5 ml-1">Seçenek Adı (Örn: Renk, Beden)</label>
                    <input
                      v-model="opt.name"
                      type="text"
                      placeholder="Renk"
                      class="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all text-sm font-bold"
                    >
                  </div>
                  <div>
                    <label class="block text-[10px] font-black text-orange-600 uppercase mb-1.5 ml-1">Değerler (Virgül ile ayırın)</label>
                    <input
                      v-model="opt.valuesStr"
                      type="text"
                      placeholder="Siyah, Beyaz, Mavi"
                      class="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all text-sm font-medium"
                    >
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="w-full py-3 border-2 border-dashed border-orange-200 text-orange-600 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-50 transition-all"
                @click="variationOptions.push({ name: '', valuesStr: '' })"
              >
                + YENİ SEÇENEK EKLE
              </button>
            </div>
          </template>
        </AdminProductForm>
      </transition>

      <!-- Products Table -->
      <AdminProductTable 
        v-if="!showForm"
        v-model:selected-ids="selectedProductIds"
        :products="products"
        :loading="loadingProducts"
        :is-all-selected="isAllSelected"
        :pagination="pagination"
        @toggle-select-all="toggleSelectAll"
        @edit="editProduct"
        @delete="deleteProduct"
        @approve="approveProduct"
        @page-change="fetchProducts"
      />
    </div>

    <!-- Bulk Edit Modal -->
    <AdminBulkUpdateModal 
      v-model="showBulkEditModal"
      :selected-count="selectedProductIds.length"
      :loading="bulkProcessing"
      @save="executeBulkUpdate"
    />
  </div>
</template>

<script setup>
import { 
  PlusIcon, 
  CloudArrowUpIcon, 
  XMarkIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/vue/24/outline'

import { useAdminProducts } from '~/composables/useAdminProducts'
import AdminProductFilter from '~/components/admin/product/AdminProductFilter.vue'
import AdminProductTable from '~/components/admin/product/AdminProductTable.vue'
import AdminBulkUpdateModal from '~/components/admin/product/AdminBulkUpdateModal.vue'
import AdminProductForm from '~/components/admin/product/AdminProductForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const { resolveImageUrl } = useAppImage()
const { $api } = useApi()
const toast = useNuxtApp().$toast

const {
  products, vendors, categories, brands, formData,
  loading, loadingProducts, editingId, showForm, showVendorProducts, showPendingProducts,
  searchQuery, selectedFilterCategoryId, selectedFilterVendorId, pagination, productStats,
  selectedProductIds, bulkProcessing, showBulkEditModal,
  selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
  variationOptions,
  mainCategories, subCategories1, subCategories2, isAllSelected,
  fetchInitialData, fetchProducts, fetchProductStats, fetchCategoryAttributes, resetForm, submitForm,
  deleteProduct, approveProduct, bulkApprove, bulkDelete, executeBulkUpdate,
  editProduct, toggleSelectAll, handleFileUpload
} = useAdminProducts()

const newImageUrl = ref('')




const removeImage = (index) => {
  const removedUrl = formData.value.productImages[index]
  formData.value.productImages.splice(index, 1)
  if (formData.value.image === removedUrl) {
    formData.value.image = formData.value.productImages[0] || ''
  }
}

const setAsMain = (index) => {
  const selectedUrl = formData.value.productImages[index]
  formData.value.productImages.splice(index, 1)
  formData.value.productImages.unshift(selectedUrl)
  formData.value.image = selectedUrl
}

const addImageUrl = () => {
  if (!newImageUrl.value) return
  if (!formData.value.productImages) formData.value.productImages = []
  if (formData.value.productImages.length >= 5) {
    toast.error('Limit aşıldı')
    return
  }
  formData.value.productImages.push(newImageUrl.value)
  if (!formData.value.image) formData.value.image = newImageUrl.value
  newImageUrl.value = ''
}

onMounted(() => {
  fetchInitialData()
  fetchProducts()
  fetchProductStats()
})

</script>
