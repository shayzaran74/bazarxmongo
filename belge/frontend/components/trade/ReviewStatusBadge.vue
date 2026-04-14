<template>
  <div class="inline-flex items-center space-x-2">
    <!-- Mutual Review Badge (Highest priority) -->
    <div
      v-if="status?.isMutual"
      class="flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 shadow-sm group hover:bg-emerald-500/20 transition-all cursor-help"
      title="Her iki taraf da birbirini değerlendirdi"
    >
      <div class="relative w-2.5 h-2.5 mr-2">
        <span class="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
        <span class="relative block w-2.5 h-2.5 bg-emerald-500 rounded-full" />
      </div>
      <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic flex items-center">
        <ArrowsRightLeftIcon class="h-3 w-3 mr-1.5" />
        KARŞILIKLI GÖRÜŞ
      </span>
    </div>

    <!-- User Reviewed / Partner Reviewed -->
    <template v-else>
      <div
        v-if="status?.hasUserReviewed"
        class="flex items-center bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5"
        title="Değerlendirmenizi yaptınız"
      >
        <CheckCircleIcon class="h-3 w-3 text-blue-500 mr-1.5" />
        <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">YORUM YAPILDI</span>
      </div>

      <div
        v-if="status?.hasPartnerReviewed"
        class="flex items-center bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5"
        title="Karşı taraf sizi değerlendirdi"
      >
        <StarIcon class="h-3 w-3 text-amber-500 mr-1.5" />
        <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">İLK YORUM
          GELDİ</span>
      </div>

      <div
        v-if="!status?.hasUserReviewed && showPrompt"
        class="flex items-center bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 hover:bg-gray-200 transition-all cursor-pointer"
        @click="$emit('review')"
      >
        <ChatBubbleOvalLeftEllipsisIcon class="h-3 w-3 text-gray-400 mr-1.5" />
        <span class="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">YORUM
          BEKLİYOR</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import {
    ArrowsRightLeftIcon,
    CheckCircleIcon,
    StarIcon,
    ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
    tradeOfferId: {
        type: String,
        required: true
    },
    showPrompt: {
        type: Boolean,
        default: true
    }
})

defineEmits(['review'])
const config = useRuntimeConfig()
const authStore = useAuthStore()

const status = ref(null)
const loading = ref(true)

const fetchStatus = async () => {
    if (!props.tradeOfferId) return

    loading.value = true
    try {
        const response = await $fetch(`/api/trade-reviews/mutual-status/${props.tradeOfferId}`, {
            baseURL: config.public.apiBase,
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        if (response.success) {
            status.value = response.data
        }
    } catch (error) {
        console.error('Fetch review status error:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchStatus()
})

// Watch for changes in tradeOfferId
watch(() => props.tradeOfferId, () => {
    fetchStatus()
})

// Expose refresh method
defineExpose({
    refresh: fetchStatus
})
</script>
