<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          🧊 Dörtlü Öne Çıkanlar (Quad Cards)
        </h1>
        <p class="text-gray-500 mt-1">
          Ana sayfada 4'lü gruplar halinde gösterilen ürünleri yönetin
        </p>
      </div>
      <div class="flex gap-3">
        <NuxtLink
          to="/admin/settings/homepage"
          class="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold flex items-center"
        >
          Geri Dön
        </NuxtLink>
        <button
          :disabled="saving"
          class="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold flex items-center shadow-lg shadow-primary-200 disabled:opacity-50"
          @click="saveAll"
        >
          <CloudArrowUpIcon
            v-if="!saving"
            class="h-5 w-5 mr-2"
          />
          <div
            v-else
            class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"
          />
          Tümünü Kaydet
        </button>
      </div>
    </div>

    <!-- Cards Control -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-20"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600" />
    </div>

    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <!-- Card 1-4 -->
      <div
        v-for="(card, cardIdx) in cards"
        :key="card.id || cardIdx"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
      >
        <div class="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span
              class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm"
            >
              {{ cardIdx + 1 }}
            </span>
            <input
              v-model="card.title"
              placeholder="Grup Başlığı"
              class="bg-transparent border-none font-bold text-lg text-gray-900 focus:ring-0 w-full"
            >
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="card.isActive"
                type="checkbox"
                class="sr-only peer"
              >
              <div
                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
              />
              <span class="ms-3 text-xs font-bold text-gray-500">{{ card.isActive ? 'Aktif' : 'Pasif'
              }}</span>
            </label>
            <button
              class="text-red-500 hover:text-red-700"
              @click="removeCard(cardIdx)"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="p-5 flex-grow space-y-4">
          <div class="mb-4">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Yönlendirme
              Linki (Opsiyonel)</label>
            <input
              v-model="card.link"
              placeholder="/products?category=elektronik"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(item, itemIdx) in card.items"
              :key="itemIdx"
              class="p-4 border border-gray-100 rounded-xl bg-gray-50 relative group"
            >
              <label
                class="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2 block"
              >Ürün
                {{ itemIdx + 1 }}</label>

              <!-- Search & Select -->
              <div class="relative mb-2">
                <div class="flex items-center gap-2">
                  <div
                    v-if="item.Product"
                    class="w-10 h-10 rounded border overflow-hidden shrink-0 bg-white"
                  >
                    <img
                      :src="resolveImageUrl(item.Product.image)"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div
                    v-else
                    class="w-10 h-10 rounded border border-dashed flex items-center justify-center shrink-0 bg-white text-gray-300"
                  >
                    <PhotoIcon class="h-5 w-5" />
                  </div>
                  <div class="flex-grow min-w-0">
                    <input
                      type="text"
                      :value="item.Product ? item.Product.name : item.searchText"
                      placeholder="Ürün ara..."
                      class="w-full bg-transparent border-none p-0 text-sm font-bold text-gray-900 truncate focus:ring-0 focus:outline-none"
                      @input="e => searchProducts(e.target.value, cardIdx, itemIdx)"
                    >
                  </div>
                  <button
                    v-if="item.Product"
                    class="text-gray-400 hover:text-red-500"
                    @click="removeItemProduct(cardIdx, itemIdx)"
                  >
                    <XMarkIcon class="h-4 w-4" />
                  </button>
                </div>

                <!-- Search Results -->
                <div
                  v-if="item.results && item.results.length > 0"
                  class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="res in item.results"
                    :key="res.id"
                    class="w-full text-left p-2 hover:bg-primary-50 flex items-center gap-2 border-b border-gray-50 last:border-none"
                    @click="selectProduct(res, cardIdx, itemIdx)"
                  >
                    <img
                      :src="resolveImageUrl(res.image)"
                      class="w-8 h-8 rounded object-cover shrink-0"
                    >
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-gray-900 truncate">
                        {{ res.name }}
                      </p>
                      <p class="text-[10px] text-gray-500">
                        {{ formatPrice(res.price) }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <input
                v-model="item.customTitle"
                placeholder="Özel Başlık (Opsiyonel)"
                class="w-full px-2 py-1 border border-transparent rounded text-[11px] hover:border-gray-200 focus:bg-white focus:ring-1 focus:ring-primary-500 outline-none transition-all"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Add New Card Placeholder -->
      <button
        v-if="cards.length < 10"
        class="bg-white/50 border-4 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-all group"
        @click="addNewCard"
      >
        <PlusCircleIcon class="h-16 w-16 mb-4 group-hover:scale-110 transition-transform" />
        <span class="text-xl font-black">YENİ GRUP EKLE</span>
        <span class="text-sm">Maksimum 10 grup ekleyebilirsiniz</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import {
    CloudArrowUpIcon,
    TrashIcon,
    PhotoIcon,
    PlusCircleIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'super-admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast
const { resolveImageUrl } = useAppImage()

const cards = ref([])
const loading = ref(true)
const saving = ref(false)

const fetchCards = async () => {
    loading.value = true
    try {
        const data = await $api('/api/v1/admin/content/quad-cards')
        if (data.success) {
            cards.value = data.data.map(c => ({
                ...c,
                items: fillItems(c.items || [])
            }))

            // If no cards, add one default
            if (cards.value.length === 0) {
                addNewCard()
            }
        }
    } catch (err) {
        console.error('Fetch error:', err)
        toast.error('Cardlar yüklenirken hata oluştu')
    } finally {
        loading.value = false
    }
}

const fillItems = (existing) => {
    const items = [...existing]
    while (items.length < 4) {
        items.push({ productId: null, customTitle: '', Product: null, results: [], searchText: '' })
    }
    return items
}

const addNewCard = () => {
    cards.value.push({
        id: `new-${Date.now()}`,
        title: 'Yeni Öne Çıkanlar',
        link: '',
        isActive: true,
        order: cards.value.length,
        items: fillItems([])
    })
}

const removeCard = (idx) => {
    cards.value.splice(idx, 1)
}

const searchProducts = async (q, cardIdx, itemIdx) => {
    const item = cards.value[cardIdx].items[itemIdx]
    item.searchText = q

    if (!q || q.length < 2) {
        item.results = []
        return
    }

    try {
        const data = await $api('/api/products', {
            query: { search: q, limit: 12 } // Artırılmış limit
        })
        if (data.success) {
            item.results = data.data
        }
    } catch (err) {
        console.error('Search error:', err)
    }
}

const selectProduct = (prod, cardIdx, itemIdx) => {
    const item = cards.value[cardIdx].items[itemIdx]
    item.Product = prod
    item.productId = prod.id
    item.results = []
    item.searchText = prod.name
}

const removeItemProduct = (cardIdx, itemIdx) => {
    const item = cards.value[cardIdx].items[itemIdx]
    item.Product = null
    item.productId = null
    item.results = []
    item.searchText = ''
}

const saveAll = async () => {
    saving.value = true
    try {
        const payload = {
            cards: cards.value.map(c => ({
                title: c.title,
                link: c.link,
                order: c.order,
                isActive: c.isActive,
                platform: 'BAZARX',
                items: c.items.map(i => ({
                    productId: i.productId,
                    title: String(i.customTitle || (i.Product ? i.Product.name : '') || 'Ürün'),
                    image: String(i.Product ? i.Product.image : '') || '',
                    order: Number(i.order || 0)
                })).filter(i => i.productId)
            }))
        }

        const data = await $api('/api/v1/admin/content/quad-cards', {
            method: 'POST',
            body: payload
        })

        if (data.success) {
            toast.success('Değişiklikler kaydedildi!')
            await fetchCards()
        }
    } catch (err) {
        console.error('Save error:', err)
        toast.error('Kaydedilirken bir hata oluştu')
    } finally {
        saving.value = false
    }
}

const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(price) / 100)
}

onMounted(fetchCards)
</script>
