<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <span class="p-3 bg-indigo-100 rounded-2xl">🔄</span>
          Akıllı Takas Eşleştirme
        </h1>
        <p class="text-gray-500 mt-2 font-medium">
          Sistemdeki ihtiyaçlar ve fazlalıklar arasında döngüsel takas
          zincirleri oluşturun.
        </p>
      </div>
      <button
        :disabled="detecting"
        class="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200"
        @click="detectCycles"
      >
        <span
          v-if="detecting"
          class="flex items-center gap-2"
        >
          <svg
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Analiz Ediliyor...
        </span>
        <span
          v-else
          class="flex items-center gap-2"
        >
          <span class="text-xl">🚀</span>
          Yeni Eşleşmeleri Bul
        </span>
      </button>
    </div>

    <!-- Search & Filter Row -->
    <div class="mb-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            class="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm font-medium"
          placeholder="Şirket, Ürün veya Zincir ID Ara..."
          @input="debouncedSearch"
        >
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
        <span>Sayfa Başına:</span>
        <select
          v-model="itemsPerPage"
          class="border-gray-200 rounded-lg text-sm h-10 px-2 bg-gray-50 font-bold focus:ring-indigo-500"
          @change="fetchChains"
        >
          <option :value="10">
            10
          </option>
          <option :value="20">
            20
          </option>
          <option :value="50">
            50
          </option>
        </select>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
          Toplam Zincir
        </p>
        <p class="text-3xl font-black text-gray-900">
          {{ pagination.total }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
          Gösterilen
        </p>
        <p class="text-3xl font-black text-amber-600">
          {{ chains.length }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
          Sayfa
        </p>
        <p class="text-3xl font-black text-green-600">
          {{ currentPage }} / {{ pagination.totalPages }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center py-24"
    >
      <div class="animate-pulse flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p class="text-indigo-600 font-bold tracking-widest uppercase text-xs">
          Veriler Yükleniyor
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="chains.length === 0"
      class="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200"
    >
      <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
        🔭
      </div>
      <h3 class="text-2xl font-black text-gray-900">
        Henüz Takas Zinciri Bulunamadı
      </h3>
      <p class="text-gray-500 mt-3 max-w-md mx-auto font-medium">
        Arama kriterlerinize uygun zincir bulunamadı veya
        henüz hiç eşleşme yapılmamış.
      </p>
    </div>

    <!-- Chains List -->
    <div
      v-else
      class="space-y-8"
    >
      <div
        v-for="chain in chains"
        :key="chain.id"
        class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
      >
        <!-- Chain Header -->
        <div
          class="bg-gray-50/50 p-6 md:px-10 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100"
        >
          <div class="flex items-center gap-4">
            <span
              class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-full shadow-lg shadow-indigo-100 uppercase tracking-widest"
            >
              ID: {{ chain.id.slice(-6) }}
            </span>
            <span
              :class="getStatusClass(chain.status)"
              class="px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest"
            >
              {{ chain.status }}
            </span>
            <span class="text-sm font-bold text-gray-400 flex items-center gap-1">
              <span class="text-lg">📅</span> {{ formatDate(chain.createdAt) }}
            </span>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Toplam Değer
              </p>
              <p class="text-xl font-black text-gray-900">
                {{ formatPrice(chain.totalValue) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Eşleşme Skoru
              </p>
              <div class="flex items-center gap-2">
                <div class="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-indigo-600"
                    :style="{ width: chain.matchScore + '%' }"
                  />
                </div>
                <p class="text-lg font-black text-indigo-600 leading-none">
                  %{{ chain.matchScore }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chain Visual Flow -->
        <div class="p-8 md:p-12">
          <div class="flex flex-col lg:flex-row items-center justify-between gap-12 relative">
            <!-- Steps -->
            <div
              v-for="(offer, index) in chain.offers"
              :key="offer.id"
              class="flex-1 w-full max-w-sm relative z-10"
            >
              <div
                class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group-hover:border-indigo-200 transition-colors"
              >
                <!-- Step Connector (Desktop) -->
                <div
                  v-if="index < chain.offers.length - 1"
                  class="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 z-0 font-black text-indigo-200 text-4xl"
                >
                  ➜
                </div>
                <!-- Step Divider (Mobile) -->
                <div
                  v-if="index < chain.offers.length - 1"
                  class="lg:hidden flex justify-center my-4 font-black text-indigo-200 text-4xl"
                >
                  ⬇️
                </div>

                <div class="flex items-start gap-4 mb-4">
                  <div
                    class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0"
                  >
                    <span class="text-xl">🏢</span>
                  </div>
                  <div>
                    <h4 class="font-black text-gray-900 truncate max-w-[150px] leading-tight">
                      {{
                        offer.fromCompany.name }}
                    </h4>
                    <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                      GÖNDERİCİ
                    </p>
                  </div>
                </div>

                <div class="bg-indigo-50/50 p-4 rounded-2xl mb-4">
                  <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                    TEKLİF EDİLEN ÜRÜN
                  </p>
                  <p class="font-bold text-gray-800 line-clamp-1">
                    {{ offer.offeredItem.title }}
                  </p>
                  <p class="text-xs text-indigo-600 font-black mt-1">
                    {{
                      formatPrice(offer.offeredValue) }}
                  </p>
                </div>

                <div
                  class="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-gray-100"
                >
                  <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      ALICI
                    </p>
                    <p class="text-xs font-black text-gray-700">
                      {{ offer.toCompany.name }}
                    </p>
                  </div>
                  <div class="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                    <span class="text-sm">✅</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cycle Connection (Desktop) -->
            <div
              class="hidden lg:block absolute left-1/2 bottom-[-40px] -translate-x-1/2 font-black text-indigo-100 text-6xl opacity-20 select-none"
            >
              DÖNGÜSEL TAKAS SİSTEMİ
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-6 bg-gray-50/30 border-t border-gray-100 flex justify-end gap-3">
          <button
            class="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-widest"
            @click="showChainDetails(chain)"
          >
            Detayları Gör
          </button>
          <button
            v-if="chain.status === 'DRAFT'"
            class="px-6 py-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl hover:bg-red-100 transition-colors uppercase tracking-widest border border-red-100"
            @click="deleteDraft(chain.id)"
          >
            🗑️ Sil
          </button>
          <button
            v-if="chain.status === 'DRAFT'"
            class="px-6 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-colors uppercase tracking-widest shadow-lg shadow-indigo-100"
            @click="approveChain(chain.id)"
          >
            Zinciri Onayla & Gönder
          </button>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div
        class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-3xl shadow-sm"
      >
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="changePage(currentPage - 1)"
          >
            Önceki
          </button>
          <button
            :disabled="currentPage === pagination.totalPages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="changePage(currentPage + 1)"
          >
            Sonraki
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 font-medium">
              Toplam <span class="font-bold">{{ pagination.total }}</span> sonuçtan
              <span class="font-bold">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> - <span
                class="font-bold"
              >{{ Math.min(currentPage * itemsPerPage, pagination.total) }}</span>
              arası gösteriliyor
            </p>
          </div>
          <div>
            <nav
              class="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                :disabled="currentPage === 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                @click="changePage(currentPage - 1)"
              >
                <span class="sr-only">Önceki</span>
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <!-- Simple Pagination Numbers -->
              <button
                v-for="p in pagination.totalPages"
                :key="p"
                :class="[p === currentPage ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0', 'relative inline-flex items-center px-4 py-2 text-sm font-semibold']"
                @click="changePage(p)"
              >
                {{ p }}
              </button>
              <button
                :disabled="currentPage === pagination.totalPages"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                @click="changePage(currentPage + 1)"
              >
                <span class="sr-only">Sonraki</span>
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <TransitionRoot
      appear
      :show="isModalOpen"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-50"
        @close="isModalOpen = false"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-4xl transform overflow-hidden rounded-[2.5rem] bg-white p-10 text-left align-middle shadow-2xl transition-all border border-gray-100"
              >
                <DialogTitle
                  as="h3"
                  class="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4"
                >
                  <span class="p-3 bg-indigo-50 rounded-2xl">🔗</span>
                  Takas Zinciri Teknik Detayı
                </DialogTitle>

                <div
                  v-if="selectedChain"
                  class="space-y-8"
                >
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-gray-100">
                        <th
                          class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                        >
                          Sıra
                        </th>
                        <th
                          class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                        >
                          Veren Şirket
                        </th>
                        <th
                          class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                        >
                          Alan Şirket
                        </th>
                        <th
                          class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                        >
                          Ürün
                        </th>
                        <th
                          class="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"
                        >
                          Tahmini Değer
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(offer, idx) in selectedChain.offers"
                        :key="offer.id"
                        class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td class="py-4 font-black text-gray-400">
                          #{{ idx + 1 }}
                        </td>
                        <td class="py-4">
                          <p class="font-bold text-gray-900">
                            {{ offer.fromCompany.name }}
                          </p>
                          <p class="text-[10px] text-gray-500 font-medium">
                            Firma ID: {{
                              offer.fromCompanyId.slice(-6) }}
                          </p>
                        </td>
                        <td class="py-4 font-bold text-gray-700">
                          {{ offer.toCompany.name }}
                        </td>
                        <td class="py-4">
                          <p class="font-bold text-indigo-600">
                            {{ offer.offeredItem.title }}
                          </p>
                          <p class="text-xs text-gray-500 font-medium">
                            {{
                              offer.offeredQuantity }}
                            {{ offer.offeredItem.unit }}
                          </p>
                        </td>
                        <td class="py-4 text-right font-black text-gray-900">
                          {{
                            formatPrice(offer.offeredValue) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="p-6 bg-indigo-50 rounded-3xl flex justify-between items-center">
                    <div>
                      <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                        Algoritma
                        Skoru
                      </p>
                      <p class="text-2xl font-black text-indigo-600">
                        %{{ selectedChain.matchScore
                        }}
                        Eşleşme Hassasiyeti
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                        Toplam
                        Döngü Hacmi
                      </p>
                      <p class="text-2xl font-black text-indigo-900">
                        {{
                          formatPrice(selectedChain.totalValue) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-10 flex justify-end gap-3">
                  <button
                    class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    @click="isModalOpen = false"
                  >
                    Vazgeç
                  </button>
                  <button
                    v-if="selectedChain?.status === 'DRAFT'"
                    class="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all"
                    @click="approveChain(selectedChain.id); isModalOpen = false"
                  >
                    Şimdi Onayla
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { debounce } from 'lodash'

definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

const { $api } = useApi()
const chains = ref([])
const loading = ref(true)
const detecting = ref(false)
const isModalOpen = ref(false)
const selectedChain = ref(null)

const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
})


const fetchChains = async () => {
    loading.value = true
    try {
        const { data, pagination: paging } = await $api('/api/admin/barter/chains', {
            params: {
                page: currentPage.value,
                limit: itemsPerPage.value,
                search: searchQuery.value
            }
        })

        if (data) {
            chains.value = data
            if (paging) {
                const limit = Number(paging.limit) || 10
                pagination.value = {
                    ...paging,
                    limit: limit,
                    totalPages: Math.ceil((paging.total || 0) / limit) || 1
                }
            }
        }
    } catch (error) {
        console.error('Fetch chains error:', error)
    } finally {
        loading.value = false
    }
}

const debouncedSearch = debounce(() => {
    currentPage.value = 1
    fetchChains()
}, 500)

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
        currentPage.value = page
        fetchChains()
    }
}

const detectCycles = async () => {
    detecting.value = true
    try {
        const response = await $api('/api/admin/barter/detect-cycles', {
            method: 'POST'
        })

        if (response.success) {
            alert(`${response.message}`)
            currentPage.value = 1
            await fetchChains()
        }
    } catch (error) {
        console.error('Detection error:', error)
        alert('Hata: ' + (error.data?.error || error.message))
    } finally {
        detecting.value = false
    }
}

const approveChain = async (id) => {
    if (!confirm('Bu zinciri onaylayıp tüm katılımcılara bildirim göndermek istediğinize emin misiniz?')) return

    try {
        loading.value = true
        const response = await $api(`/api/admin/barter/approve-chain/${id}`, {
            method: 'POST'
        })

        if (response.success) {
            alert(`${response.message}`)
            await fetchChains()
        }
    } catch (error) {
        console.error('Approve chain error:', error)
        alert('Onaylama hatası: ' + (error.data?.error || error.message))
    } finally {
        loading.value = false
    }
}

const deleteDraft = async (id) => {
    if (!confirm('Bu takas taslağını silmek istediğinize emin misiniz?')) return

    try {
        loading.value = true
        const response = await $api(`/api/admin/barter/chains/${id}`, {
            method: 'DELETE'
        })

        if (response.success) {
            await fetchChains()
        }
    } catch (error) {
        console.error('Delete draft error:', error)
        alert('Silme hatası: ' + (error.data?.error || error.message))
    } finally {
        loading.value = false
    }
}

const showChainDetails = (chain) => {
    selectedChain.value = chain
    isModalOpen.value = true
}

const getStatusClass = (status) => {
    switch (status) {
        case 'DRAFT': return 'bg-amber-100 text-amber-700'
        case 'PENDING': return 'bg-blue-100 text-blue-700'
        case 'COMPLETED': return 'bg-green-100 text-green-700'
        case 'FAILED': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price || 0)
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}



onMounted(() => {
    fetchChains()
})
</script>

<style scoped>
.bg-mesh {
    background-image:
        radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.05) 0px, transparent 50%);
}
</style>
