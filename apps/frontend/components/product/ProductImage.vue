<template>
  <div
    class="relative overflow-hidden bg-gray-100"
    :class="containerClass"
  >
    <!-- Blurhash Canvas (Placeholder) -->
    <canvas
      v-if="blurhash && !isLoaded"
      ref="canvasRef"
      class="absolute inset-0 w-full h-full object-cover"
      width="32"
      height="32"
    />

    <!-- Main Image -->
    <img
      v-if="imageSrc"
      :src="imageSrc"
      :alt="alt"
      :class="[
        'w-full h-full object-cover transition-opacity duration-500',
        imageClass,
        { 'opacity-0': blurhash && !isLoaded, 'opacity-100': isLoaded || !blurhash }
      ]"
      :loading="loading"
      @load="onLoad"
      @error="onError"
    />
    
    <!-- Fallback Icon if no image -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-8 h-8"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface ImageObject {
  url: string
  blurhash?: string
}

const props = defineProps<{
  src?: string | ImageObject | null
  alt?: string
  loading?: 'lazy' | 'eager'
  containerClass?: string
  imageClass?: string
}>()

const { resolveImageUrl } = useAppImage()
const isLoaded = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const imageSrc = computed(() => {
  if (!props.src) return null
  if (typeof props.src === 'string') return resolveImageUrl(props.src)
  return props.src.url ? resolveImageUrl(props.src.url) : null
})

const blurhash = computed(() => {
  if (typeof props.src === 'object' && props.src && 'blurhash' in props.src) {
    return props.src.blurhash
  }
  return null
})

const onLoad = () => {
  isLoaded.value = true
}

const onError = () => {
  isLoaded.value = true
}

watch(() => blurhash.value, () => {
  // blurhash logic removed to avoid dependency issue
}, { immediate: true })

onMounted(() => {
    // blurhash logic removed
})
</script>
