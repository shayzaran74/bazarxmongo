<template>
  <div
    class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4"
  >
    <!-- DEBUG: Veri yoksa bile bu yazıyı görmeliyiz -->
    <div v-if="cards.length === 0" class="text-center py-4 text-gray-500 text-xs font-bold border-2 border-dashed border-gray-200 rounded-xl mb-4">
      [QUAD DEBUG] Veri Bekleniyor... (Platform: BAZARX)
    </div>

    <div 
      v-if="cards.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
    >
      <LayoutQuadCard
        v-for="(card, index) in cards"
        :key="index"
        :title="card.title"
        :items="card.items"
        :link="card.link"
        @item-click="onItemClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigateTo } from '#imports'
import type { HomeQuadCard, ApiResponse, HomeQuadCardItem } from '@barterborsa/shared-types'

const props = defineProps<{
  show?: string | boolean
}>()

const cards = ref<HomeQuadCard[]>([])
const loading = ref(false)

const fetchQuadCards = async () => {
  loading.value = true
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002'
    const fullUrl = `${baseUrl}/api/v1/home-quad-cards?platform=BAZARX`
    
    // Ham tarayıcı fetch'i kullanarak Nuxt yapılandırmasını tamamen baypas ediyoruz
    const res = await fetch(fullUrl)
    const data = await res.json()
    
    if (data && Array.isArray(data)) {
      // Map title to label for QuadCard component, handling both wrapped (props) and flat structures
      cards.value = data.map((item: any) => {
        const raw = item.props || item
        return {
          ...item,
          title: raw.title,
          link: raw.link,
          items: (raw.items || []).map((sub: any) => {
            const subRaw = sub.props || sub
            return {
              ...sub,
              label: subRaw.title,
              image: subRaw.image
            }
          })
        }
      })
    }
  } catch (error) {
    console.error('Fetch quad cards error:', error)
  } finally {
    loading.value = false
  }
}

const emit = defineEmits<{
  (e: 'item-click', item: HomeQuadCardItem): void
}>()

const onItemClick = (item: HomeQuadCardItem) => {
  if (item.link) navigateTo(item.link)
  emit('item-click', item)
}

onMounted(() => {
  fetchQuadCards()
})
</script>
