<template>
  <div class="p-6 max-w-10xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 italic uppercase tracking-tight">📁 Kategori Yönetimi</h1>
        <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1 italic">Ürün hiyerarşisini ve premium vitrin ayarlarını yönetin</p>
      </div>
      <button 
        class="bg-gray-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center gap-3"
        @click="openCreate"
      >
        <PlusIcon class="h-4 w-4" /> Yeni Kategori Ekle
      </button>
    </div>

    <!-- Table Container -->
    <div v-if="!loading || categories.length" class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kategori & Hiyerarşi</th>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tür</th>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kapasite</th>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Envanter</th>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rozet</th>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Durum</th>
              <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Aksiyonlar</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="main in categories.filter(c => !c.parentId)" :key="main.id">
              <CategoryTreeRow 
                :category="main" 
                :level="0" 
                :is-expanded="expandedCategories.includes(main.id)"
                @toggle="toggleExpanded(main.id)"
                @edit="openEdit(main)"
                @delete="deleteCategory(main.id)"
              />
              
              <!-- Sub Categories (Level 1) -->
              <template v-if="expandedCategories.includes(main.id)">
                <template v-for="sub in main.children" :key="sub.id">
                  <CategoryTreeRow 
                    :category="sub" 
                    :level="1" 
                    :is-expanded="expandedCategories.includes(sub.id)"
                    @toggle="toggleExpanded(sub.id)"
                    @edit="openEdit(sub)"
                    @delete="deleteCategory(sub.id)"
                  />
                  
                  <!-- Detail Categories (Level 2) -->
                  <template v-if="expandedCategories.includes(sub.id)">
                    <CategoryTreeRow 
                      v-for="leaf in sub.children"
                      :key="leaf.id"
                      :category="leaf" 
                      :level="2" 
                      @edit="openEdit(leaf)"
                      @delete="deleteCategory(leaf.id)"
                    />
                  </template>
                </template>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty/Loading State Overlay -->
    <div v-if="loading && !categories.length" class="py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
      <div class="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategoriler Yükleniyor...</p>
    </div>

    <!-- Modals -->
    <CategoryFormModal 
      :is-open="showModal"
      :is-editing="!!editingCategory"
      :form="categoryForm"
      :preview="imagePreview ?? undefined"
      :loading="loading"
      :categories="categories"
      @close="showModal = false"
      @save="saveCategory"
      @upload="handleFileUpload"
      @remove-image="imagePreview = null; categoryForm.image = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import { useAdminCategories } from '~/composables/useAdminCategories'
import CategoryTreeRow from '~/components/admin/categories/CategoryTreeRow.vue'
import CategoryFormModal from '~/components/admin/categories/CategoryFormModal.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Kategori Yönetimi - Admin' })

const { 
  categories, loading, showModal, editingCategory, expandedCategories, categoryForm, imagePreview,
  fetchCategories, toggleExpanded, saveCategory, deleteCategory, handleFileUpload, resetForm
} = useAdminCategories()

const openCreate = () => { resetForm(); showModal.value = true }
const openEdit = (cat: any) => { 
  editingCategory.value = cat
  // Deep copy form and handle specialty fields
  categoryForm.value = JSON.parse(JSON.stringify(cat))
  showModal.value = true
}

onMounted(fetchCategories)
</script>

<style scoped>
.animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
