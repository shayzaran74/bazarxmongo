<template>
  <div class="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <ShieldCheckIcon class="h-10 w-10 text-blue-600" />
          Marka Yönetimi
        </h1>
        <p class="text-sm text-gray-500 font-medium mt-1">
          Üreticileri, distribütörleri ve marka ihlallerini uçtan uca yönetin.
        </p>
      </div>
      <button
        class="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center gap-2"
        @click="openCreateModal"
      >
        <PlusIcon class="h-5 w-5" />
        Yeni Marka Ekle
      </button>
    </div>

    <!-- Stats Cards -->
    <BrandStatsCards :stats="brandStats" />

    <!-- Tabs & Filters Nav -->
    <div class="space-y-4">
      <BrandTabBar v-model="currentTab" :stats="brandStats" />
      
      <BrandFilters 
        v-if="currentTab !== 'violations'"
        v-model:search-query="searchQuery"
        v-model:status="currentStatus"
        v-model:selected-letter="selectedLetter"
        @search="handleSearch"
      />
    </div>

    <!-- Dynamic Content Area -->
    <div v-if="loading && brands.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
      <ArrowPathIcon class="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <p class="text-gray-400 font-black uppercase tracking-widest text-xs">Markalar Yükleniyor...</p>
    </div>

    <div v-else>
      <!-- View: Pending Applications -->
      <BrandPendingList 
        v-if="currentTab === 'pending'" 
        :brands="brands" 
        @review="openReviewModal"
      />

      <!-- View: All Brands Table -->
      <BrandTable 
        v-if="currentTab === 'all'" 
        :brands="brands" 
        :loading="loading"
        @edit="editBrand"
        @delete="deleteBrand"
      />

      <!-- View: Violations -->
      <BrandViolationList 
        v-if="currentTab === 'violations'" 
        :violations="violations"
        @view="openViolationModal"
        @resolve="resolveViolationQuickly"
      />
    </div>

    <!-- Modals -->
    <BrandReviewModal 
      v-model:rejection-reason="rejectionReason"
      v-model:is-popular="isPopularToggle"
      :show="showReviewModal"
      :brand="selectedBrand"
      :selected-template="selectedTemplate"
      :submitting="submitting"
      :templates="rejectionTemplates"
      @close="showReviewModal = false"
      @select-template="v => { selectedTemplate = v.id; rejectionReason = v.label }"
      @approve="approveBrandApplication(selectedBrand.id)"
      @reject="rejectBrandApplication(selectedBrand.id)"
      @request-docs="requestAdditionalDocs(selectedBrand.id)"
    />

    <BrandFormModal 
      v-model="formData"
      :show="showModal"
      :is-editing="isEditing"
      :saving="saving"
      @close="showModal = false"
      @save="saveBrand"
      @generate-slug="generateSlug"
    />

    <BrandViolationModal 
      v-model:severity="violationSeverity"
      v-model:status="violationStatus"
      v-model:notes="violationNotes"
      :show="showViolationModal"
      :violation="selectedViolation"
      :submitting="submitting"
      @close="showViolationModal = false"
      @update="updateViolation"
    />
  </div>
</template>

<script setup>
import { 
  ShieldCheckIcon, 
  PlusIcon, 
  ArrowPathIcon 
} from '@heroicons/vue/24/outline'

import { useAdminBrands } from '~/composables/useAdminBrands'

// Components
import BrandStatsCards from '~/components/admin/brands/BrandStatsCards.vue'
import BrandTabBar from '~/components/admin/brands/BrandTabBar.vue'
import BrandFilters from '~/components/admin/brands/BrandFilters.vue'
import BrandPendingList from '~/components/admin/brands/BrandPendingList.vue'
import BrandTable from '~/components/admin/brands/BrandTable.vue'
import BrandViolationList from '~/components/admin/brands/BrandViolationList.vue'
import BrandReviewModal from '~/components/admin/brands/BrandReviewModal.vue'
import BrandFormModal from '~/components/admin/brands/BrandFormModal.vue'
import BrandViolationModal from '~/components/admin/brands/BrandViolationModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const {
  brands, loading, saving, submitting, brandStats,
  currentTab, currentStatus, searchQuery, selectedLetter,
  showModal, showReviewModal, isEditing, selectedBrand, rejectionReason, selectedTemplate, isPopularToggle,
  violations, showViolationModal, selectedViolation, violationNotes, violationStatus, violationSeverity,
  formData,
  fetchBrands, handleSearch, openReviewModal, approveBrandApplication,
  requestAdditionalDocs, rejectBrandApplication, saveBrand, deleteBrand,
  updateViolation, resolveViolationQuickly, openViolationModal, generateSlug
} = useAdminBrands()

const rejectionTemplates = [
  { id: 'ILLEGIBLE_DOC', label: 'Okunaksız Belge' },
  { id: 'MISSING_CHAIN', label: 'Eksik Fatura Silsilesi' },
  { id: 'MISSING_SIGNATURE', label: 'Marka Sahibi İmzası Eksik' },
  { id: 'EXPIRED_CERT', label: 'Tescil Belgesi Süresi Dolmuş' },
  { id: 'INVALID_CLASS', label: 'Marka Sınıfı Uyumsuz' },
  { id: 'OTHER', label: 'Diğer' }
]

const openCreateModal = () => {
  isEditing.value = false
  selectedBrand.value = null
  formData.value = { name: '', slug: '', icon: '', image: '', isPopular: false, order: 0, status: 'APPROVED' }
  showModal.value = true
}

const editBrand = (brand) => {
  isEditing.value = true
  selectedBrand.value = brand
  formData.value = { ...brand }
  showModal.value = true
}

onMounted(fetchBrands)
</script>

<style scoped>
/* Page specific styles if needed */
</style>
