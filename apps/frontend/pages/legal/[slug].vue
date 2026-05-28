<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      
      <!-- Sidebar Navigation -->
      <aside class="w-full md:w-64 shrink-0">
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-8">
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">
            İLGİLİ METİNLER
          </h3>
          
          <div v-if="relatedPending" class="space-y-4 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-full" />
            <div class="h-4 bg-gray-200 rounded w-5/6" />
            <div class="h-4 bg-gray-200 rounded w-4/6" />
          </div>
          
          <ul v-else-if="relatedArticles?.length" class="space-y-2">
            <li v-for="item in relatedArticles" :key="item.id">
              <NuxtLink
                :to="`/legal/${item.slug}`"
                class="block px-4 py-2 rounded-xl text-sm font-medium transition-all"
                :class="item.slug === route.params.slug ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
          
          <div v-else class="text-xs text-gray-500">
            İlgili içerik bulunamadı.
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 min-w-0">
        <!-- Loading State -->
        <div
          v-if="pending"
          class="space-y-4 animate-pulse"
        >
          <div class="h-8 bg-gray-200 rounded w-3/4" />
          <div class="space-y-3 pt-6">
            <div class="h-4 bg-gray-200 rounded w-full" />
            <div class="h-4 bg-gray-200 rounded w-full" />
            <div class="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>

        <!-- Content -->
        <div
          v-else-if="document"
          class="prose prose-blue max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
        >
          <h1 class="text-3xl font-black mb-8 pb-4 border-b border-gray-100">
            {{ document.title }}
          </h1>
          <div 
            class="whitespace-pre-line leading-relaxed" 
            v-html="document.content"
          ></div>
          <div class="mt-12 text-sm text-gray-400 border-t border-gray-100 pt-6">
            Son Güncelleme: {{ document.updatedAt ? new Date(document.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor' }}
          </div>
        </div>

        <!-- Not Found -->
        <div
          v-else
          class="text-center py-12"
        >
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Belge Bulunamadı
          </h2>
          <p class="text-gray-500 mb-6">
            Aradığınız yasal metin şu an görüntülenemiyor.
          </p>
          <NuxtLink
            to="/"
            class="btn-primary px-6 py-2 rounded-xl text-sm"
          >
            Ana Sayfaya Dön
          </NuxtLink>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const { $api } = useApi()

// Fetch current article
const { data, pending } = await useAsyncData(`legal-${route.params.slug}`, () => 
  $api(`/api/v1/help/articles/${route.params.slug}`)
)

const document = computed(() => data.value?.data || data.value)

// Fetch related articles based on categoryId
const { data: allArticlesData, pending: relatedPending } = await useAsyncData(`legal-related-${route.params.slug}`, async () => {
  // Only fetch if we have a categoryId
  if (!document.value?.categoryId) return null
  return $api('/api/v1/help/search?q=')
}, {
  watch: [() => document.value?.categoryId]
})

const relatedArticles = computed(() => {
  const arr = allArticlesData.value?.data || []
  const catId = document.value?.categoryId
  if (!catId) return []
  return arr.filter((a: any) => a.categoryId === catId && a.status === 'PUBLISHED').sort((a: any, b: any) => a.order - b.order)
})

useHead({
  title: computed(() => document.value ? `${document.value.title} - Hukuki Metinler` : 'Yükleniyor...'),
})
</script>
