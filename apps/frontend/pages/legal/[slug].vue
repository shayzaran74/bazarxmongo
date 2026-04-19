<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
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
        class="prose prose-orange max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
      >
        <h1 class="text-3xl font-black mb-8 pb-4 border-b border-gray-100">
          {{ document.title }}
        </h1>
        <div class="whitespace-pre-line leading-relaxed">
          {{ document.content }}
        </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLegalService } from '~/services/api/LegalService'
const route = useRoute()
const legalService = useLegalService()

// Using the legal routes I created in backend/src/routes/legal.js
// Route was /api/legal/:slug
const { data, pending } = await useAsyncData(`legal-${route.params.slug}`, () => legalService.getPolicy(route.params.slug as string))

// Since backend returns { success: true, data: { ... } }
// We need to access data.value.data
const document = computed(() => data.value?.data)

useHead({
  title: computed(() => document.value ? `${document.value.title} - Hukuki Metinler` : 'Yükleniyor...'),
})
</script>
