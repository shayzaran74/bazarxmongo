<template>
  <div class="p-6 space-y-6 bg-gray-50/50 min-h-screen">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <TagIcon class="h-10 w-10 text-blue-600" />
          Marka Temsilciliklerim
        </h1>
        <p class="text-sm text-gray-500 font-medium mt-1">
          Kendi markalarınızı veya yetkili bayisi olduğunuz markaları yönetin.
        </p>
      </div>
      <button
        class="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
        @click="showWizard = true"
      >
        <PlusIcon class="h-5 w-5" />
        Yeni Marka Başvurusu
      </button>
    </div>

    <!-- Stats and Banners -->
    <VendorBrandStats 
      :stats="brandStats" 
      :brands="brands" 
    />

    <!-- Main Table Area -->
    <div class="space-y-4">
      <div class="flex items-center justify-between px-2">
        <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Başvuru Geçmişi</h3>
        <button 
          class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          @click="fetchBrands"
        >
          <ArrowPathIcon :class="['h-5 w-5', loading ? 'animate-spin' : '']" />
        </button>
      </div>

      <VendorBrandTable 
        :brands="brands" 
        :loading="loading" 
      />
    </div>

    <!-- Application Wizard -->
    <BrandApplicationWizard 
      v-model:form="form"
      :show="showWizard"
      :step="currentStep"
      :can-proceed="canProceed"
      :submitting="submitting"
      @close="showWizard = false"
      @prev="prevStep"
      @next="nextStep"
      @submit="submitApplication"
      @upload="handleFileUpload"
    />
  </div>
</template>

<script setup>
import { TagIcon, PlusIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useVendorBrands } from '~/composables/useVendorBrands'

// Components
import VendorBrandStats from '~/components/vendor/brands/VendorBrandStats.vue'
import VendorBrandTable from '~/components/vendor/brands/VendorBrandTable.vue'
import BrandApplicationWizard from '~/components/vendor/brands/BrandApplicationWizard.vue'

definePageMeta({
  layout: 'vendor',
  middleware: ['auth', 'vendor']
})

const {
  brands, loading, submitting, brandStats, showWizard, currentStep, form,
  fetchBrands, handleFileUpload, submitApplication, nextStep, prevStep, canProceed
} = useVendorBrands()

onMounted(fetchBrands)
</script>

<style scoped>
/* Page specific custom styles */
</style>
