<template>
  <div class="py-12 lg:py-20 italic">
    <!-- Hero Section -->
    <WantedHero @add="showAddModal = true" />

    <!-- Stats -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-pulse">
      <div v-for="i in 3" :key="i" class="h-32 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm" />
    </div>
    <WantedStats v-else-if="wantedItems.length > 0" :total="wantedItems.length" :active="activeCount" :categories="uniqueCategories" />

    <!-- Main Content -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 space-y-8">
      <div class="w-16 h-16 border-[6px] border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">İSTEKLER ANALİZ EDİLİYOR...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="wantedItems.length === 0" class="text-center py-32 bg-white/50 backdrop-blur-3xl rounded-[4rem] border-4 border-dashed border-neutral-100 shadow-inner group">
      <div class="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl group-hover:scale-110 transition-transform">
        <MagnifyingGlassIcon class="h-10 w-10 text-indigo-400" />
      </div>
      <h3 class="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tightest">HENÜZ İSTEK YOK</h3>
      <p class="text-sm font-black text-gray-400 max-w-md mx-auto mb-12 uppercase tracking-widest opacity-70">İHTİYACIN OLAN MAKİNE VEYA HAMMADDELERİ LİSTELEYEREK AKILLI TAKAS MOTORUNU BAŞLATIN.</p>
      <button class="inline-flex items-center gap-4 bg-indigo-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-black transition-all shadow-2xl shadow-indigo-100 active:scale-95" @click="showAddModal = true">
        <PlusCircleIcon class="h-6 w-6" />
        İLK İSTEĞİNİ OLUŞTUR
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      <WantedItemCard v-for="item in wantedItems" :key="item.id" :item="item" @edit="(i) => { editingItemId = i.id; formData = { ...i, keywordsText: i.keywords.join(', ') }; isEditing = true; showAddModal = true }" />
    </div>

    <!-- Form Modal -->
    <WantedFormModal
      :is-open="showAddModal"
      :is-editing="isEditing"
      :loading="submitting"
      :formData="formData"
      :categories="categories"
      v-model:mainCategory="selectedMainCategory"
      v-model:subCategory1="selectedSubCategory1"
      @close="closeModal"
      @submit="submitItem"
    />
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
import WantedHero from '~/components/dashboard/wanted/WantedHero.vue'
import WantedStats from '~/components/dashboard/wanted/WantedStats.vue'
import WantedItemCard from '~/components/dashboard/wanted/WantedItemCard.vue'
import WantedFormModal from '~/components/dashboard/wanted/WantedFormModal.vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })
useHead({ title: 'ARANAN ÜRÜNLER // BAZARX' })

const {
  wantedItems, categories, loading, showAddModal, submitting, isEditing,
  formData, selectedMainCategory, selectedSubCategory1,
  activeCount, uniqueCategories, fetchData, submitItem, closeModal
} = useWantedItems()
</script>
