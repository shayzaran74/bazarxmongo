<template>
  <div class="py-12 lg:py-16">
    <!-- Hero Section -->
    <div
      class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[3rem] p-10 mb-12 shadow-2xl"
    >
      <div class="absolute inset-0 bg-black/10" />
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div class="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-300/20 rounded-full blur-2xl" />

      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <span class="p-3 bg-white/20 backdrop-blur-sm rounded-2xl text-3xl">🔍</span>
            <h1 class="text-4xl font-black text-white tracking-tight uppercase italic">
              Ne Arıyorsun?
            </h1>
          </div>
          <p class="text-white/80 text-sm font-medium max-w-lg">
            İhtiyacın olan makine, hammadde veya parçaları sisteme ekle.
            Akıllı takas algoritması seni otomatik olarak satıcılarla eşleştirsin.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink
            to="/dashboard/wanted-items/manage"
            class="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-white/30 transition-all border border-white/30"
          >
            <ClipboardDocumentListIcon class="h-6 w-6" />
            <span>Yönet</span>
          </NuxtLink>
          <button
            class="flex items-center justify-center gap-3 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
            @click="showAddModal = true"
          >
            <PlusCircleIcon class="h-6 w-6" />
            <span>Yeni İstek</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div
      v-if="!loading && wantedItems.length > 0"
      class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
    >
      <div class="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
        <div class="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <MagnifyingGlassIcon class="h-7 w-7 text-indigo-600" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Toplam İstek
          </p>
          <p class="text-3xl font-black text-gray-900">
            {{ wantedItems.length }}
          </p>
        </div>
      </div>
      <div class="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
        <div class="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
          <CheckCircleIcon class="h-7 w-7 text-green-600" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Aktif Arama
          </p>
          <p class="text-3xl font-black text-green-600">
            {{ activeCount }}
          </p>
        </div>
      </div>
      <div class="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center gap-4">
        <div class="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
          <TagIcon class="h-7 w-7 text-purple-600" />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Kategori
          </p>
          <p class="text-3xl font-black text-purple-600">
            {{ uniqueCategories }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-24"
    >
      <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
      <p class="text-indigo-600 font-bold uppercase tracking-widest text-xs">
        İstekler Yükleniyor...
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="wantedItems.length === 0"
      class="text-center py-24 bg-white/50 backdrop-blur-md rounded-[4rem] border border-dashed border-gray-200"
    >
      <div
        class="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <MagnifyingGlassIcon class="h-12 w-12 text-indigo-400" />
      </div>
      <h3 class="text-3xl font-black text-gray-900 mb-3 uppercase italic tracking-tight">
        Henüz İstek Yok
      </h3>
      <p class="text-sm font-medium text-gray-500 max-w-md mx-auto mb-8">
        İhtiyacın olan makine, hammadde veya parçaları listeleyerek akıllı takas motorunu başlat.
      </p>
      <button
        class="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm hover:bg-indigo-700 transition-all shadow-xl"
        @click="showAddModal = true"
      >
        <PlusCircleIcon class="h-5 w-5" />
        İlk İsteğini Oluştur
      </button>
    </div>

    <!-- Wanted Items Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <div
        v-for="item in wantedItems"
        :key="item.id"
        class="group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
      >
        <!-- Decorative Top Bar -->
        <div class="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div class="p-7">
          <!-- Header Row -->
          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <span class="text-xl">📂</span>
              </div>
              <div>
                <span
                  class="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full"
                >
                  {{ item.category?.name || 'Genel' }}
                </span>
                <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {{ formatDate(item.createdAt) }}
                </p>
              </div>
            </div>

            <!-- Delete Button -->
            <!-- Delete Button Removed -->
          </div>

          <!-- Description -->
          <p class="text-lg font-bold text-gray-900 leading-snug mb-4 line-clamp-2 min-h-[3.5rem]">
            {{ item.description || 'Detaylı açıklama girilmemiş' }}
          </p>

          <!-- Budget Box -->
          <div
            class="bg-gradient-to-r from-gray-50 to-indigo-50/50 p-4 rounded-2xl mb-5 border border-gray-100"
          >
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Bütçe Aralığı
            </p>
            <div class="flex items-center gap-2">
              <CurrencyDollarIcon class="h-5 w-5 text-indigo-500" />
              <span
                v-if="item.minPrice || item.maxPrice"
                class="text-lg font-black text-gray-900"
              >
                {{ formatPrice(item.minPrice) }} — {{ formatPrice(item.maxPrice) }}
              </span>
              <span
                v-else
                class="text-gray-400 italic text-sm"
              >Belirtilmemiş</span>
            </div>
          </div>

          <!-- Keywords -->
          <div
            v-if="item.keywords && item.keywords.length > 0"
            class="flex flex-wrap gap-2 mb-5"
          >
            <span
              v-for="(keyword, idx) in item.keywords.slice(0, 5)"
              :key="idx"
              class="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-gray-200"
            >
              #{{ keyword }}
            </span>
            <span
              v-if="item.keywords.length > 5"
              class="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full"
            >
              +{{ item.keywords.length - 5 }}
            </span>
          </div>

          <!-- Status Footer -->
          <div class="pt-5 border-t border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                />
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span class="text-[10px] font-black text-green-600 uppercase tracking-widest">
                {{ item.status === 'APPROVED' ? 'Onaylandı' : (item.status === 'REJECTED' ? 'Reddedildi'
                  : 'Onay Bekliyor') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <TransitionRoot
      appear
      :show="showAddModal"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-[300]"
        @close="closeModal"
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
          <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
                class="w-full max-w-xl transform overflow-hidden rounded-[2.5rem] bg-white p-8 text-left align-middle shadow-2xl transition-all"
              >
                <DialogTitle
                  as="h3"
                  class="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3"
                >
                  <span class="p-2 bg-indigo-100 rounded-xl">{{ isEditing ? '✏️' : '➕' }}</span>
                  {{ isEditing ? 'İsteği Düzenle' : 'Yeni İhtiyaç Ekle' }}
                </DialogTitle>
                <p class="text-sm text-gray-500 mb-8">
                  Sistemin seni doğru satıcılarla eşleştirebilmesi
                  için detayları doldur.
                </p>

                <form
                  class="space-y-6"
                  @submit.prevent="submitItem"
                >
                  <!-- Type Selection -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2"
                      >İşlem
                        Türü *</label>
                      <select
                        v-model="formData.listingType"
                        required
                        class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="BUY">
                          Arıyorum (Alım)
                        </option>
                        <option value="SELL">
                          Sağlıyorum (Satış/Hizmet)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2"
                      >Tip
                        *</label>
                      <select
                        v-model="formData.type"
                        required
                        class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="PRODUCT">
                          Ürün / Malzeme
                        </option>
                        <option value="SERVICE">
                          Hizmet
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Category (Hierarchical) -->
                  <div class="space-y-4">
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2"
                    >Kategori
                      *</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select
                        v-model="selectedMainCategory"
                        class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="">
                          Ana Kategori Seçin
                        </option>
                        <option
                          v-for="cat in mainCategories"
                          :key="cat.id"
                          :value="cat.id"
                        >
                          {{
                            cat.name }}
                        </option>
                      </select>

                      <select
                        v-if="subCategories1.length > 0"
                        v-model="selectedSubCategory1"
                        class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="">
                          Alt Kategori Seçin
                        </option>
                        <option
                          v-for="cat in subCategories1"
                          :key="cat.id"
                          :value="cat.id"
                        >
                          {{
                            cat.name }}
                        </option>
                      </select>
                    </div>
                    <div
                      v-if="selectedSubCategory1 && subCategories2.length > 0"
                      class="mt-4"
                    >
                      <select
                        v-model="selectedSubCategory2"
                        class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="">
                          Detay Kategori Seçin
                        </option>
                        <option
                          v-for="cat in subCategories2"
                          :key="cat.id"
                          :value="cat.id"
                        >
                          {{
                            cat.name }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Price Range -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2"
                      >Min
                        Bütçe (₺)</label>
                      <input
                        v-model.number="formData.minPrice"
                        type="number"
                        placeholder="0"
                        class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                    </div>
                    <div>
                      <label
                        class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2"
                      >Max
                        Bütçe (₺)</label>
                      <input
                        v-model.number="formData.maxPrice"
                        type="number"
                        placeholder="100.000"
                        class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                    </div>
                  </div>

                  <!-- Keywords -->
                  <div>
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2"
                    >Anahtar
                      Kelimeler</label>
                    <input
                      v-model="formData.keywordsText"
                      type="text"
                      placeholder="CNC, Siemens, 5 Eksen (virgülle ayırın)"
                      class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                    <p class="text-[10px] text-gray-400 mt-1">
                      Anahtar kelimeler eşleştirme
                      kalitesini artırır.
                    </p>
                  </div>

                  <!-- Description -->
                  <div>
                    <label
                      class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2"
                    >Detaylı
                      Açıklama *</label>
                    <textarea
                      v-model="formData.description"
                      rows="4"
                      required
                      placeholder="Tam olarak ne aradığınızı, teknik özelliklerini ve beklentilerinizi yazın..."
                      class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>

                  <!-- Buttons -->
                  <div class="flex gap-4 pt-4">
                    <button
                      type="button"
                      class="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
                      @click="closeModal"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      :disabled="submitting"
                      class="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                      {{ submitting ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Oluştur') }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { useCategoryService } from '~/services/api/CategoryService'
import { useWantedItemService } from '~/services/api/WantedItemService'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import {
    PlusCircleIcon, MagnifyingGlassIcon, CheckCircleIcon,
    TagIcon, CurrencyDollarIcon, ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

const wantedItemService = useWantedItemService()
const categoryService = useCategoryService()
const authStore = useAuthStore()
const wantedItems = ref([])
const categories = ref([])
const loading = ref(true)
const showAddModal = ref(false)
const submitting = ref(false)
const isEditing = ref(false)
const editingItemId = ref(null)

const formData = ref({
    categoryId: '',
    listingType: 'BUY',
    type: 'PRODUCT',
    minPrice: null,
    maxPrice: null,
    keywordsText: '',
    description: ''
})

const selectedMainCategory = ref('')
const selectedSubCategory1 = ref('')
const selectedSubCategory2 = ref('')

const mainCategories = computed(() => {
    return categories.value.filter(c => !c.parentId)
})

const subCategories1 = computed(() => {
    if (!selectedMainCategory.value) return []
    return categories.value.filter(c => c.parentId === selectedMainCategory.value)
})

const subCategories2 = computed(() => {
    if (!selectedSubCategory1.value) return []
    return categories.value.filter(c => c.parentId === selectedSubCategory1.value)
})

watch([selectedMainCategory, selectedSubCategory1, selectedSubCategory2], () => {
    formData.value.categoryId = selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value || ''
})

const activeCount = computed(() => wantedItems.value.filter(i => i.isActive !== false).length)
const uniqueCategories = computed(() => new Set(wantedItems.value.map(i => i.categoryId)).size)

const fetchData = async () => {
    loading.value = true
    try {
        // Get My Wanted Items
        const itemsRes = await wantedItemService.getMyItems()

        if (itemsRes.success) {
            wantedItems.value = itemsRes.data || []
        }

        // Get Categories
        const catsRes = await categoryService.getCategories()

        if (catsRes.success) {
            categories.value = catsRes.data || []
        }

    } catch (e) {
        console.error('Veri çekme hatası:', e)
    } finally {
        loading.value = false
    }
}

const submitItem = async () => {
    submitting.value = true
    try {
        const keywords = formData.value.keywordsText.split(',').map(k => k.trim()).filter(k => k)
        const payload = { ...formData.value, keywords }
        delete payload.keywordsText

        if (isEditing.value && editingItemId.value) {
            await wantedItemService.updateItem(String(editingItemId.value), payload)
            useNuxtApp().$toast?.success('İstek güncellendi!')
        } else {
            await wantedItemService.createItem(payload)
            useNuxtApp().$toast?.success('Yeni istek oluşturuldu!')
        }

        closeModal()
        fetchData()

    } catch (e) {
        console.error('Kayıt hatası:', e)
        useNuxtApp().$toast?.error('Hata: ' + (e.data?.error || e.message))
    } finally {
        submitting.value = false
    }
}


const closeModal = () => {
    showAddModal.value = false
    isEditing.value = false
    editingItemId.value = null
    selectedMainCategory.value = ''
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    formData.value = { categoryId: '', listingType: 'BUY', type: 'PRODUCT', minPrice: null, maxPrice: null, keywordsText: '', description: '' }
}

const formatPrice = (price) => {
    if (!price) return '0 ₺'
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price)
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
    await authStore.init()
    if (authStore.isAuthenticated) {
        fetchData()
    }
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
