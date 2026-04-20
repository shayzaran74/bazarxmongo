<template>
  <div class="min-h-screen bg-slate-950 p-8">
    <div class="max-w-[1600px] mx-auto space-y-12">
      <!-- ── HEADER PROTOCOL ── -->
      <CategoryAttributesHeader
        :category-name="category?.name"
        @add="openCreateModal"
      />

      <!-- ── ATTRIBUTES ENGINE ── -->
      <div v-if="attributes.length === 0 && !loading" class="bg-slate-900/20 rounded-[4rem] border-2 border-dashed border-slate-800/50 py-40 text-center space-y-10 font-sans italic">
         <div class="w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center mx-auto ring-8 ring-slate-900/50 shadow-2xl relative overflow-hidden group">
            <span class="text-6xl group-hover:scale-110 transition-transform duration-500 opacity-20">🏷️</span>
         </div>
         <div class="max-w-md mx-auto space-y-4 px-10">
            <h3 class="text-3xl font-black text-slate-100 uppercase tracking-tightest">MATRİS BOŞ</h3>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-relaxed">BU KATEGORİ İÇİN HENÜZ ÖZELLİK TANIMLANMADI. ÜRÜN STANDARTLARINI BELİRLEMEK İÇİN İLK PARAMETREYİ EKLEYİN.</p>
         </div>
         <button
            class="bg-blue-600 text-white rounded-[1.5rem] px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 active:scale-95 transition-all outline-none"
            @click="openCreateModal"
          >
            + İLK ÖZELLİĞİ KONFİGÜRE ET
          </button>
      </div>

      <div v-else-if="!loading">
         <CategoryAttributesTable
           :attributes="attributes"
           :type-labels="typeLabels"
           @edit="openEditModal"
           @delete="deleteAttribute"
         />
      </div>

      <!-- ── LOADING STATE ── -->
      <div v-if="loading" class="py-40 text-center space-y-6 font-sans italic">
         <div class="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
         <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest">SİSTEM TARANIYOR...</p>
      </div>

      <!-- ── CONFIGURATION MODAL ── -->
      <CategoryAttributesModal
        v-model="attrForm"
        v-model:options-input="optionsInput"
        :is-open="showModal"
        :is-editing="!!editingAttribute"
        :parsed-options="parsedOptions"
        @close="closeModal"
        @save="saveAttribute"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryAttributesHeader from '~/components/admin/category/CategoryAttributesHeader.vue'
import CategoryAttributesTable from '~/components/admin/category/CategoryAttributesTable.vue'
import CategoryAttributesModal from '~/components/admin/category/CategoryAttributesModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({
  title: 'KATEGORİ ÖZELLİK MATRİSİ // BAZARX'
})

const route = useRoute()
const categoryId = route.params.id as string

const {
  category, attributes, loading, showModal, editingAttribute, optionsInput, attrForm, typeLabels, parsedOptions,
  openCreateModal, openEditModal, closeModal, saveAttribute, deleteAttribute
} = useCategoryAttributes(categoryId)
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
