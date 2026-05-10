<!-- components/TrendyolImportModal.vue -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="$emit('update:modelValue', false)"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <!-- Başlık -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <ArrowDownTrayIcon class="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 class="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Trendyol'dan İçe Aktar
                  </h2>
                  <p class="text-[10px] text-gray-400 font-medium mt-0.5">
                    JSON dosyanızı yükleyin, ürünleri seçin ve aktarın
                  </p>
                </div>
              </div>
              <button
                class="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                @click="$emit('update:modelValue', false)"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>

            <!-- İçerik -->
            <div class="flex-1 overflow-hidden flex flex-col">

              <!-- Adım 1: Dosya Yükleme -->
              <div v-if="!parsedProducts.length" class="flex flex-col items-center justify-center p-12 space-y-5">
                <div class="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-orange-200">
                  <DocumentIcon class="h-8 w-8 text-orange-400" />
                </div>
                <div class="text-center">
                  <p class="text-sm font-black text-gray-800 uppercase tracking-widest">JSON Dosyası Seçin</p>
                  <p class="text-xs text-gray-400 mt-1">
                    Trendyol scraper çıktısı olan
                    <code class="bg-gray-100 px-1.5 py-0.5 rounded text-orange-600 font-mono text-[10px]">.json</code>
                    dosyasını yükleyin
                  </p>
                </div>
                <label class="cursor-pointer bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/30 flex items-center space-x-2">
                  <FolderOpenIcon class="h-4 w-4" />
                  <span>Dosya Seç</span>
                  <input type="file" accept=".json" class="hidden" @change="handleFileSelect" />
                </label>
                <p v-if="parseError" class="text-xs text-red-500 font-semibold bg-red-50 px-4 py-2 rounded-xl">
                  {{ parseError }}
                </p>
              </div>

              <!-- Adım 2: Ürün Listesi -->
              <template v-else>
                <!-- Özet Bar -->
                <div class="flex items-center justify-between px-6 py-3 bg-orange-50/60 border-b border-orange-100">
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        class="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                        @change="toggleAll"
                      />
                      <span class="text-[10px] font-black uppercase text-gray-600 tracking-widest">Tümünü Seç</span>
                    </label>
                    <span class="text-[10px] font-bold text-gray-400">
                      {{ selectedIds.size }} / {{ parsedProducts.length }} seçili
                    </span>
                  </div>
                  <button
                    class="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1"
                    @click="resetFile"
                  >
                    <ArrowPathIcon class="h-3.5 w-3.5" />
                    <span>Dosyayı Değiştir</span>
                  </button>
                </div>

                <!-- Ürün Tablosu -->
                <div class="flex-1 overflow-y-auto">
                  <table class="w-full text-left">
                    <thead class="bg-gray-50 sticky top-0 z-10">
                      <tr class="text-[9px] uppercase tracking-widest font-black text-gray-400">
                        <th class="px-4 py-3 w-10" />
                        <th class="px-4 py-3">Ürün</th>
                        <th class="px-4 py-3">Marka</th>
                        <th class="px-4 py-3 text-right">Fiyat</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr
                        v-for="product in parsedProducts"
                        :key="product.external_id"
                        class="hover:bg-orange-50/30 transition-colors"
                        :class="{ 'bg-orange-50/20': selectedIds.has(product.external_id) }"
                      >
                        <td class="px-4 py-3">
                          <input
                            type="checkbox"
                            :checked="selectedIds.has(product.external_id)"
                            class="rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                            @change="toggleProduct(product.external_id)"
                          />
                        </td>
                        <td class="px-4 py-3">
                          <div class="flex items-center space-x-3">
                            <img
                              v-if="product.image_url"
                              :src="product.image_url"
                              class="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                              @error="($event.target as HTMLImageElement).style.display = 'none'"
                            />
                            <div
                              v-else
                              class="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center"
                            >
                              <PhotoIcon class="h-5 w-5 text-gray-300" />
                            </div>
                            <p class="text-xs font-semibold text-gray-800 line-clamp-2 max-w-xs">
                              {{ product.title }}
                            </p>
                          </div>
                        </td>
                        <td class="px-4 py-3">
                          <span class="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg line-clamp-1 max-w-[100px] block">
                            {{ shortBrand(product.brand) }}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                          <span class="text-sm font-black text-gray-900">
                            {{ formatPrice(product.price) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </div>

            <!-- Alt Footer -->
            <div v-if="parsedProducts.length" class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <!-- Sonuç Mesajı -->
              <div v-if="importResult" class="flex items-center space-x-2">
                <CheckCircleIcon v-if="importResult.failed === 0" class="h-5 w-5 text-green-500" />
                <ExclamationCircleIcon v-else class="h-5 w-5 text-amber-500" />
                <span class="text-xs font-bold" :class="importResult.failed === 0 ? 'text-green-700' : 'text-amber-700'">
                  {{ importResult.success }} ürün eklendi{{ importResult.failed > 0 ? `, ${importResult.failed} başarısız` : '' }}
                </span>
              </div>
              <div v-else class="flex items-center gap-4">
                <span class="text-[10px] text-gray-400 font-medium">{{ selectedIds.size }} ürün aktarılacak</span>
                <label class="flex items-center gap-2">
                  <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Varsayılan Stok:</span>
                  <input
                    v-model.number="defaultStock"
                    type="number"
                    min="1"
                    max="9999"
                    class="w-20 h-8 text-xs font-bold text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
                    title="Açıklamada stok bilgisi yoksa bu değer kullanılır"
                  />
                </label>
              </div>

              <div class="flex items-center space-x-3">
                <button
                  class="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 transition-colors"
                  @click="$emit('update:modelValue', false)"
                >
                  İptal
                </button>
                <button
                  :disabled="selectedIds.size === 0 || importing"
                  class="bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/30 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="doImport"
                >
                  <span v-if="importing" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  <ArrowDownTrayIcon v-else class="h-3.5 w-3.5" />
                  <span>{{ importing ? 'Aktarılıyor...' : 'İçe Aktar' }}</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  FolderOpenIcon,
  ArrowPathIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline'
import { useVendorService } from '~/services/api/VendorService'
import { useAdminProductService } from '~/services/api/AdminProductService'

interface TrendyolProduct {
  external_id: string
  title: string
  price: number
  image_url?: string
  image_urls?: string[]
  brand?: string
  description?: string
  subcategory?: string
  category?: string
  attributes?: Record<string, string>
  additional_info?: Record<string, string> | null
}

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

const props = defineProps<{
  modelValue: boolean
  /** 'vendor' → /vendors/inventory/import-trendyol, 'admin' → /admin/products/import/trendyol */
  mode: 'vendor' | 'admin'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'imported', result: ImportResult): void
}>()

const toast = useNuxtApp().$toast
const vendorService = useVendorService()
const adminProductService = useAdminProductService()

const parsedProducts = ref<TrendyolProduct[]>([])
const selectedIds = ref(new Set<string>())
const parseError = ref('')
const importing = ref(false)
const importResult = ref<ImportResult | null>(null)
const defaultStock = ref(1)

const isAllSelected = computed(
  () => parsedProducts.value.length > 0 && selectedIds.value.size === parsedProducts.value.length,
)

// Marka adı bazen ürün başlığı kadar uzun; kırp
const shortBrand = (brand?: string) => {
  if (!brand) return '-'
  return brand.length > 30 ? brand.slice(0, 30) + '…' : brand
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0)

const handleFileSelect = (event: Event) => {
  parseError.value = ''
  importResult.value = null
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const raw = JSON.parse(e.target?.result as string)
      const arr: TrendyolProduct[] = Array.isArray(raw) ? raw : [raw]
      if (!arr.length) {
        parseError.value = 'JSON dosyası boş ürün içeriyor.'
        return
      }
      parsedProducts.value = arr
      // Varsayılan olarak tümünü seç
      selectedIds.value = new Set(arr.map((p) => p.external_id))
    } catch {
      parseError.value = 'Geçersiz JSON dosyası. Lütfen Trendyol scraper çıktısını yükleyin.'
    }
  }
  reader.readAsText(file)
}

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(parsedProducts.value.map((p) => p.external_id))
  }
}

const toggleProduct = (id: string) => {
  const set = new Set(selectedIds.value)
  if (set.has(id)) {
    set.delete(id)
  } else {
    set.add(id)
  }
  selectedIds.value = set
}

const resetFile = () => {
  parsedProducts.value = []
  selectedIds.value = new Set()
  importResult.value = null
  parseError.value = ''
}

const doImport = async () => {
  if (selectedIds.value.size === 0) return
  importing.value = true
  importResult.value = null

  const selected = parsedProducts.value
    .filter((p) => selectedIds.value.has(p.external_id))
    .map((p) => p as unknown as Record<string, unknown>)

  try {
    let result: ImportResult

    if (props.mode === 'admin') {
      const res = await adminProductService.importTrendyol(selected, defaultStock.value)
      // Admin endpoint kuyruğa alır; jobId döner
      result = { success: selected.length, failed: 0, errors: [] }
      if (res && (res as { jobId?: string }).jobId) {
        toast.success(`${selected.length} ürün kuyruğa alındı. Job ID: ${(res as { jobId: string }).jobId}`)
      } else {
        toast.success(`${selected.length} ürün kuyruğa alındı`)
      }
    } else {
      const res = await vendorService.importTrendyol(selected, defaultStock.value)
      const data = (res as { results?: ImportResult }).results ?? { success: 0, failed: 0, errors: [] }
      result = data
      if (data.failed === 0) {
        toast.success(`${data.success} ürün başarıyla eklendi`)
      } else {
        toast.warning(`${data.success} eklendi, ${data.failed} başarısız`)
      }
    }

    importResult.value = result
    emit('imported', result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
    toast.error(`İçe aktarım hatası: ${msg}`)
  } finally {
    importing.value = false
  }
}

// Modal kapandığında state'i sıfırla
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      setTimeout(resetFile, 300)
    }
  },
)
</script>
