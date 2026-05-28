<template>
  <div class="p-8 max-w-7xl mx-auto space-y-12 min-h-screen bg-slate-950 text-slate-200 font-sans italic">
    <!-- Header Protocol -->
    <div
      class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div class="relative z-10">
        <h1
          class="text-4xl md:text-6xl font-black bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent uppercase tracking-tightest leading-none"
        >
          YARDIM MERKEZİ<br><span class="text-blue-500">KONTROL PANELİ</span>
        </h1>
        <p class="text-[10px] font-black text-slate-500 mt-4 uppercase tracking-[0.4em] ml-1">KATEGORİ VE MAKALE YÖNETİM SİSTEMİ v2.0</p>
      </div>
      <div class="flex flex-wrap gap-4 relative z-10">
        <button
          class="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-slate-700 transition-all shadow-xl active:scale-95"
          @click="openCategoryModal"
        >
          📁 KATEGORİ EKLE
        </button>
        <button
          class="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95"
          @click="openArticleModal()"
        >
          🚀 YENİ MAKALE YAYINLA
        </button>
      </div>
    </div>

    <!-- Stats Section -->
    <AdminHelpStats
      :article-count="articles.length"
      :category-count="categories.length"
      :total-views="totalViews"
    />

    <!-- List Section -->
    <AdminHelpList
      v-model:search-query="searchQuery"
      :articles="filteredArticles"
      :categories="categories"
      @edit="openArticleModal"
      @delete="deleteArticle"
      @delete-category="deleteCategory"
    />

    <!-- Modals -->
    <AdminHelpArticleModal
      v-model="editingArticle"
      :is-open="isArticleModalOpen"
      :categories="categories"
      @close="closeArticleModal"
      @save="saveArticle"
    />

    <AdminHelpCategoryModal
      v-model="editingCategory"
      :is-open="isCategoryModalOpen"
      @close="closeCategoryModal"
      @save="saveCategory"
    />
  </div>
</template>

<script setup lang="ts">
import AdminHelpStats from '~/components/admin/help/AdminHelpStats.vue'
import AdminHelpList from '~/components/admin/help/AdminHelpList.vue'
import AdminHelpArticleModal from '~/components/admin/help/AdminHelpArticleModal.vue'
import AdminHelpCategoryModal from '~/components/admin/help/AdminHelpCategoryModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({
  title: 'YARDIM MERKEZİ YÖNETİMİ // BAZARX'
})

const {
  articles, categories, searchQuery, isArticleModalOpen, isCategoryModalOpen,
  editingArticle, editingCategory, totalViews, filteredArticles,
  openArticleModal, closeArticleModal, openCategoryModal, closeCategoryModal,
  saveCategory, saveArticle, deleteArticle, deleteCategory
} = useAdminHelp()
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
