<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
          🏷️ Marka <span class="text-indigo-600">Yönetimi</span>
        </h1>
        <p class="text-gray-500 mt-1 font-medium italic opacity-70">Platform markalarını, başvuruları ve ihlal bildirimlerini yönetin.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-gray-900 transition-all shadow-lg flex items-center gap-2" @click="openNewBrand">
          <PlusIcon class="w-5 h-5" /> YENİ MARKA
        </button>
        <button class="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group" @click="fetchBrands">
          <ArrowPathIcon class="h-6 w-6 text-indigo-600 group-hover:rotate-180 transition-all duration-500" />
        </button>
      </div>
    </div>

    <!-- Stats -->
    <BrandStats :stats="brandStats" />

    <!-- Tab Control -->
    <div class="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit mb-8">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
        :class="currentTab === tab.key ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'"
        @click="currentTab = tab.key"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
        <span v-if="tab.key === 'pending' && brandStats.PENDING" class="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{{ brandStats.PENDING }}</span>
        <span v-if="tab.key === 'violations' && brandStats.VIOLATIONS" class="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">{{ brandStats.VIOLATIONS }}</span>
      </button>
    </div>

    <!-- Content -->
    <div v-if="currentTab !== 'violations'" class="animate-in fade-in duration-300">
      <BrandTable
        v-model:current-page="currentPage"
        v-model:selected-letter="selectedLetter"
        :brands="brands"
        :total-items="totalItems"
        :total-pages="totalPages"
        :search-query="searchQuery"
        :resolve-image-url="resolveImageUrl"
        @search="handleSearch"
        @review="openReviewModal"
        @edit="openEditBrand"
        @delete="deleteBrand"
      />
    </div>

    <div v-else class="animate-in fade-in duration-300">
      <BrandViolations
        :violations="violations"
        :loading="violationsLoading"
        @review="openViolationModal"
        @resolve-quick="resolveViolationQuickly"
      />
    </div>

    <!-- Modals -->
    <BrandFormModal
      :show="showModal"
      :is-editing="isEditing"
      :form="formData"
      :saving="saving"
      @close="showModal = false"
      @save="saveBrand"
      @generate-slug="generateSlug"
    />

    <BrandReviewModal
      :show="showReviewModal"
      :brand="selectedBrand"
      :is-popular="isPopularToggle"
      :resolve-image-url="resolveImageUrl"
      @close="showReviewModal = false"
      @approve="approveBrandApplication(selectedBrand?.id)"
      @reject="(reason) => { rejectionReason = reason; rejectBrandApplication(selectedBrand?.id) }"
      @request-docs="requestAdditionalDocs(selectedBrand?.id)"
      @update:isPopular="isPopularToggle = $event"
    />
  </div>
</template>

<script setup>
import { PlusIcon, ArrowPathIcon, ClockIcon, TagIcon, ShieldExclamationIcon } from '@heroicons/vue/24/outline'
import { useAdminBrands } from '~/composables/useAdminBrands'

import BrandStats from '~/components/admin/brands/BrandStats.vue'
import BrandTable from '~/components/admin/brands/BrandTable.vue'
import BrandViolations from '~/components/admin/brands/BrandViolations.vue'
import BrandFormModal from '~/components/admin/brands/BrandFormModal.vue'
import BrandReviewModal from '~/components/admin/brands/BrandReviewModal.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Marka Yönetimi - BazarX Admin' })

const {
  brands, loading, saving, brandStats,
  currentTab, searchQuery, selectedLetter, currentPage, totalPages, totalItems,
  showModal, showReviewModal, isEditing, selectedBrand, rejectionReason, isPopularToggle,
  violations, violationsLoading, formData,
  fetchBrands, handleSearch, openReviewModal, approveBrandApplication,
  requestAdditionalDocs, rejectBrandApplication, saveBrand, deleteBrand,
  resolveViolationQuickly, openViolationModal, generateSlug, resolveImageUrl
} = useAdminBrands()

const tabs = [
  { key: 'pending',    label: 'Bekleyenler', icon: ClockIcon },
  { key: 'all',        label: 'Tüm Markalar', icon: TagIcon },
  { key: 'violations', label: 'İhlaller', icon: ShieldExclamationIcon }
]

const openNewBrand = () => {
  isEditing.value = false
  selectedBrand.value = null
  formData.value = { name: '', slug: '', icon: '', image: '', isPopular: false, order: 0, status: 'APPROVED' }
  showModal.value = true
}

const openEditBrand = (brand) => {
  isEditing.value = true
  selectedBrand.value = brand
  formData.value = { ...brand }
  showModal.value = true
}

onMounted(fetchBrands)
</script>
