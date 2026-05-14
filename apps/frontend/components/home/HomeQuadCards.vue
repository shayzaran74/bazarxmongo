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
    const { $api } = useApi()
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase || 'http://localhost:3002'
    const data = await $api(`${apiBase}/api/v1/home-quad-cards`, { query: { platform: 'BAZARX' } }) as ApiResponse<HomeQuadCard[]>
    console.log('[QuadCards] Show:', props.show, 'Data:', data)
    if (data.success && data.data) {
      // Map title to label for QuadCard component
      cards.value = data.data.map(card => ({
        ...card,
        items: (card.items || []).map(item => ({
          ...item,
          label: item.title // QuadCard.vue 'label' bekliyor
        }))
      }))
      console.log('[QuadCards] Cards loaded:', cards.value.length)
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
