<template>
  <div class="min-h-screen bg-slate-950 p-8 font-sans italic">
    <div class="max-w-7xl mx-auto space-y-12">
      <!-- ── HEADER PROTOCOL ── -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div class="relative z-10 flex items-center gap-8">
          <NuxtLink
            to="/admin/collections"
            class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 active:scale-90 shadow-xl"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </NuxtLink>
          <div>
            <h1 class="text-3xl md:text-5xl font-black text-slate-100 uppercase tracking-tightest leading-none">
              {{ isEditing ? 'KOLEKSİYON DÜZENLE' : 'YENİ KOLEKSİYON' }}
            </h1>
            <p class="text-[10px] font-black text-slate-500 mt-3 uppercase tracking-[0.4em] ml-1">İÇERİK VE ENVANTER YAPILANDIRMA MODÜLÜ</p>
          </div>
        </div>

        <div class="flex items-center gap-4 relative z-10">
          <NuxtLink
            to="/admin/collections"
            class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-200 transition-all"
          >
            İŞLEMİ İPTAL ET
          </NuxtLink>
          <button
            :disabled="saving"
            class="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            @click="saveCollection"
          >
            {{ saving ? 'VERİ AKTARILIYOR...' : 'SİSTEME KAYDET' }}
          </button>
        </div>
      </div>

      <!-- ── CONFIGURATION GRID ── -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Panel -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Basic Info -->
          <CollectionBasicInfo v-model="form" />

          <!-- Type Selector -->
          <CollectionTypeSelector v-model="form" />

          <!-- Manual Product Engine -->
          <CollectionManualProducts
            v-if="form.type === 'Manual'"
            v-model:product-search="productSearch"
            :selected-products="selectedProducts"
            :search-results="searchResults"
            @add="addProduct"
            @remove="removeProduct"
          />

          <!-- Automatic Condition Engine -->
          <CollectionAutoConditions
            v-else
            v-model="form"
            :conditions="conditions"
            @add="addCondition"
            @remove="removeCondition"
          />

          <!-- SEO & Handle -->
          <CollectionMetaSEO v-model="form" />
        </div>

        <!-- Sidebar Panel -->
        <div class="lg:col-span-4 space-y-8">
          <CollectionSidebar v-model="form" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import CollectionBasicInfo from '~/components/admin/collection/CollectionBasicInfo.vue'
import CollectionTypeSelector from '~/components/admin/collection/CollectionTypeSelector.vue'
import CollectionManualProducts from '~/components/admin/collection/CollectionManualProducts.vue'
import CollectionAutoConditions from '~/components/admin/collection/CollectionAutoConditions.vue'
import CollectionMetaSEO from '~/components/admin/collection/CollectionMetaSEO.vue'
import CollectionSidebar from '~/components/admin/collection/CollectionSidebar.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({
  title: 'KOLEKSİYON YÖNETİMİ // BAZARX'
})

const {
  form, isEditing, saving, productSearch, searchResults, selectedProducts, conditions,
  searchProducts, addProduct, removeProduct, addCondition, removeCondition, saveCollection
} = useCollectionForm()

// Search trigger
watch(productSearch, () => {
  searchProducts()
})
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
