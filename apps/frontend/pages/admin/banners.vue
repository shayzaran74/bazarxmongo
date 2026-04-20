<template>
  <div class="p-6 max-w-10xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-black text-gray-900 italic uppercase">
          🖼️ Banner Yönetimi
        </h1>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
          Ana sayfa üst kısmında görünen kayan banner'ları yönetin
        </p>
      </div>
      <button
        class="px-8 py-4 bg-gray-900 text-white rounded-[2rem] hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 group"
        @click="openCreateModal"
      >
        <PlusIcon class="h-4 w-4 group-hover:rotate-90 transition-transform" />
        Yeni Banner Ekle
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-gray-900" />
    </div>

    <!-- Empty State -->
    <div v-else-if="banners.length === 0" class="bg-white rounded-[3rem] shadow-sm border border-gray-50 p-20 text-center">
      <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <PhotoIcon class="h-10 w-10 text-gray-200" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 mb-2 italic uppercase">Henüz Banner Eklenmemiş</h3>
      <p class="text-sm font-bold text-gray-400 mb-8 italic uppercase tracking-wider">Ana sayfada görüntülenecek banner'lar ekleyin.</p>
      <button class="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl" @click="openCreateModal">
        İlk Banner'ı Ekle
      </button>
    </div>

    <!-- Banners Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BannerGridItem
        v-for="banner in banners"
        :key="banner.id"
        :banner="banner"
        @edit="editBanner(banner)"
        @toggle="toggleStatus(banner)"
        @delete="confirmDelete(banner)"
      />
    </div>

    <!-- Create/Edit Modal -->
    <BannerFormModal
      :is-open="showModal"
      :is-editing="isEditing"
      :form="formData"
      :preview="imagePreview"
      :loading="saving"
      :cities="cityList"
      :districts="districtList"
      @close="showModal = false"
      @save="saveBanner"
      @upload="handleUpload"
      @remove-image="imagePreview = null; formData.imageUrl = ''"
    />

    <!-- Delete Confirmation -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showDeleteModal = false" />
      <div class="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl">
        <div class="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrashIcon class="h-10 w-10" />
        </div>
        <h3 class="text-xl font-black text-gray-900 mb-2 italic uppercase">Banner'ı Sil</h3>
        <p class="text-xs font-bold text-gray-400 mb-8 italic uppercase tracking-wider">Bu işlem geri alınamaz. Emin misiniz?</p>
        <div class="flex gap-4">
          <button class="flex-1 h-14 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors" @click="showDeleteModal = false">Vazgeç</button>
          <button class="flex-1 h-14 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all" @click="deleteBanner">
            {{ deleting ? 'SİLİNİYOR...' : 'SİL' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, PhotoIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BannerGridItem from '~/components/admin/banners/BannerGridItem.vue'
import BannerFormModal from '~/components/admin/banners/BannerFormModal.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Banner Yönetimi - Admin' })

const {
  banners, loading, saving, deleting, uploading, 
  showModal, showDeleteModal, isEditing, formData,
  imagePreview, cityList, districtList,
  fetchBanners, saveBanner, deleteBanner, toggleStatus, handleUpload,
  openCreateModal, editBanner
} = useAdminBanners()

const bannerToDelete = ref(null)

const confirmDelete = (banner) => {
  bannerToDelete.value = banner
  showDeleteModal.value = true
}

onMounted(fetchBanners)
</script>
