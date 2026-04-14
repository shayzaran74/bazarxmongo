<template>
  <div class="min-h-screen bg-gray-50 pb-20 font-sans">
    <!-- Breadcrumb & Header -->
    <div class="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <nav class="flex text-sm font-medium text-gray-500 mb-4">
          <NuxtLink
            to="/help"
            class="hover:text-orange-600 transition-colors flex items-center gap-1"
          >
            <HomeIcon class="w-4 h-4" /> Yardım
          </NuxtLink>
          <span class="mx-2 text-gray-300">/</span>
          <NuxtLink
            v-if="article?.category"
            :to="`/help/category/${article.category.slug}`"
            class="hover:text-orange-600 transition-colors"
          >
            {{ article.category.title }}
          </NuxtLink>
          <span class="mx-2 text-gray-300">/</span>
          <span
            v-if="article"
            class="text-gray-900 truncate max-w-[200px]"
          >{{ article.title }}</span>
        </nav>
        <h1
          v-if="article"
          class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight"
        >
          {{ article.title }}
        </h1>
        <div
          v-else
          class="h-10 w-3/4 bg-gray-100 rounded-lg animate-pulse mb-2"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div
        v-if="pending"
        class="space-y-6 animate-pulse"
      >
        <div class="h-4 bg-gray-200 rounded w-full" />
        <div class="h-4 bg-gray-200 rounded w-5/6" />
        <div class="h-4 bg-gray-200 rounded w-4/6" />
        <div class="h-40 bg-gray-200 rounded-xl w-full" />
      </div>

      <div
        v-else-if="article"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12"
      >
        <div class="prose prose-orange prose-lg max-w-none whitespace-pre-line text-gray-600">
          {{ article.content }}
        </div>

        <!-- Feedback (Simplistic) -->
        <div class="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span class="text-gray-900 font-bold block">Bu makale yardımcı oldu mu?</span>
            <span class="text-gray-500 text-sm">Görüşleriniz bizim için önemli.</span>
          </div>
          <div class="flex gap-3">
            <button
              class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors border border-gray-100 font-medium"
            >
              <HandThumbUpIcon class="w-5 h-5" /> Evet
            </button>
            <button
              class="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 transition-colors border border-gray-100 font-medium"
            >
              <HandThumbDownIcon class="w-5 h-5" /> Hayır
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
      >
        <ExclamationCircleIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          Makale bulunamadı
        </h2>
        <p class="text-gray-500 mb-6">
          Aradığınız içerik kaldırılmış veya taşınmış olabilir.
        </p>
        <NuxtLink
          to="/help"
          class="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors inline-block shadow-lg shadow-orange-200"
        >
          Yardım Merkezine Dön
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHelpService } from '~/services/api/HelpService'
import { HandThumbUpIcon, HandThumbDownIcon, HomeIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const helpService = useHelpService()

const { data, pending } = await useAsyncData(`article-${route.params.slug}`, () => helpService.getArticle(route.params.slug as string))

const article = computed(() => data.value?.data)

useHead({
  title: computed(() => article.value ? `${article.value.title} - Yardım Merkezi` : 'Yükleniyor...'),
})
</script>
