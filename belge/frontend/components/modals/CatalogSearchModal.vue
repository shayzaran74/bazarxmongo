<template>
  <TransitionRoot
    as="template"
    :show="isOpen"
  >
    <Dialog
      as="div"
      class="relative z-50"
      @close="close"
    >
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl"
            >
              <div class="bg-white p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                  <div>
                    <DialogTitle
                      as="h3"
                      class="text-xl font-bold text-gray-900 flex items-center"
                    >
                      <MagnifyingGlassIcon class="h-6 w-6 mr-2 text-primary-600" />
                      Katalogda Ürün Ara
                    </DialogTitle>
                    <p class="text-sm text-gray-500 mt-1">
                      Eklemek istediğiniz ürün katalogda varsa
                      buradan seçebilirsiniz.
                    </p>
                  </div>
                  <button
                    class="text-gray-400 hover:text-gray-500"
                    @click="close"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>

                <!-- Search Input -->
                <div class="relative mb-6">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    v-model="query"
                    type="text"
                    class="block w-full pl-11 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    placeholder="Ürün adı, marka veya model arayın..."
                    @keyup.enter="search"
                  >
                  <button
                    :disabled="searching || !query"
                    class="absolute inset-y-2 right-2 px-6 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
                    @click="search"
                  >
                    Ara
                  </button>
                </div>

                <!-- Results -->
                <div class="min-h-[300px] max-h-[500px] overflow-y-auto">
                  <div
                    v-if="searching"
                    class="flex flex-col items-center justify-center py-12"
                  >
                    <div
                      class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"
                    />
                    <p class="text-gray-500 font-medium">
                      Katalog taranıyor...
                    </p>
                  </div>

                  <div
                    v-else-if="results.length > 0"
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div
                      v-for="product in results"
                      :key="product.id"
                      class="border rounded-2xl p-4 hover:border-primary-500 cursor-pointer transition-all hover:shadow-md group flex space-x-4"
                      @click="selectProduct(product)"
                    >
                      <div class="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          :src="resolveImageUrl(product.images?.[0] || product.image)"
                          class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        >
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-gray-900 truncate">
                          {{ product.name }}
                        </h4>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                          {{
                            product.description }}
                        </p>
                        <div class="mt-2 flex items-center space-x-2">
                          <span
                            class="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-600 rounded-full"
                          >
                            {{ product.brand || 'Markasız' }}
                          </span>
                          <span
                            v-if="product.sellerCount > 0"
                            class="text-[10px] font-medium text-green-600"
                          >
                            {{ product.sellerCount }} Satıcıda mevcut
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else-if="hasSearched"
                    class="text-center py-12"
                  >
                    <div
                      class="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4"
                    >
                      <FaceFrownIcon class="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 class="text-lg font-bold text-gray-900">
                      Sonuç Bulunamadı
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">
                      Aradığınız kriterlere uygun katalog ürünü
                      bulunamadı.
                    </p>
                    <button
                      class="mt-6 text-primary-600 font-bold hover:text-primary-700 underline underline-offset-4"
                      @click="createNew"
                    >
                      Yeni bir ürün oluşturmak için devam et &rarr;
                    </button>
                  </div>

                  <div
                    v-else
                    class="text-center py-12"
                  >
                    <div
                      class="bg-primary-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4"
                    >
                      <SparklesIcon class="h-8 w-8 text-primary-400" />
                    </div>
                    <h3 class="text-lg font-bold text-gray-900">
                      Hızlı Başlangıç
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">
                      Katalogda yer alan binlerce ürün arasından
                      seçim yapın.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <p class="text-xs text-gray-500 italic">
                  * Mevcut kataloğu kullanarak ürün eklemek marka tutarlılığını korur.
                </p>
                <div class="flex space-x-3">
                  <button
                    class="px-4 py-2 text-sm font-bold text-gray-700 hover:text-gray-900"
                    @click="close"
                  >
                    Kapat
                  </button>
                  <button
                    class="px-6 py-2 bg-white border-2 border-primary-600 text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors"
                    @click="createNew"
                  >
                    Yeni Ürün Oluştur
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch, useAppImage, useApi } from '#imports'
import {
    Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot
} from '@headlessui/vue'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'
import MagnifyingGlassIcon from '@heroicons/vue/24/outline/MagnifyingGlassIcon'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import FaceFrownIcon from '@heroicons/vue/24/outline/FaceFrownIcon'

defineProps({
    isOpen: Boolean
})

const emit = defineEmits(['close', 'select', 'create-new'])

const { resolveImageUrl } = useAppImage()
const { $api } = useApi()

const query = ref('')
const searching = ref(false)
const hasSearched = ref(false)
const results = ref([])

// Debounce timer reference
let debounceTimer = null

const search = async () => {
    if (!query.value || query.value.trim().length < 2) {
        results.value = []
        hasSearched.value = false
        return
    }

    searching.value = true
    hasSearched.value = true

    try {
        const data = await $api('/api/products/natural-search', {
            query: { q: query.value, limit: 20 }
        })

        if (data.success) {
            // Natural search returns CatalogItem objects
            results.value = data.data || []
        }
    } catch (error) {
        console.error('Katalog araması hatası:', error)
        results.value = []
    } finally {
        searching.value = false
    }
}

// Debounced search - triggers 300ms after user stops typing
const debouncedSearch = () => {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
        search()
    }, 300)
}

// Watch for query changes and trigger debounced search
watch(query, (newQuery) => {
    if (newQuery && newQuery.trim().length >= 2) {
        debouncedSearch()
    } else {
        // Clear results if query is too short
        results.value = []
        hasSearched.value = false
    }
})

const selectProduct = (product) => {
    emit('select', product)
    close()
}

const createNew = () => {
    emit('create-new')
    close()
}

const close = () => {
    emit('close')
    // Clear debounce timer
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    // Reset state after a small delay to avoid flicker
    setTimeout(() => {
        query.value = ''
        results.value = []
        hasSearched.value = false
    }, 300)
}
</script>
