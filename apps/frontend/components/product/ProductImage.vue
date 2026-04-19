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
    <NuxtImg
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

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { decode } from 'blurhash'

const props = defineProps({
  src: {
    type: [String, Object], // Can be URL string or Object { url, blurhash }
    default: null
  },
  alt: {
    type: String,
    default: 'Ürün Görseli'
  },
  loading: {
    type: String,
    default: 'lazy'
  },
  containerClass: {
    type: String,
    default: ''
  },
  imageClass: {
    type: String,
    default: ''
  }
})

const { resolveImageUrl } = useAppImage()
const isLoaded = ref(false)
const canvasRef = ref(null)

const imageSrc = computed(() => {
  if (!props.src) return null
  if (typeof props.src === 'string') return resolveImageUrl(props.src)
  return props.src.url ? resolveImageUrl(props.src.url) : null
})

const blurhash = computed(() => {
  if (typeof props.src === 'object' && props.src?.blurhash) {
    return props.src.blurhash
  }
  return null
})

const drawBlurhash = () => {
  if (!blurhash.value || !canvasRef.value) return

  try {
    const pixels = decode(blurhash.value, 32, 32)
    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    
    const imageData = ctx.createImageData(32, 32)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
  } catch (e) {
    console.warn('Blurhash decode error:', e)
  }
}

const onLoad = () => {
  isLoaded.value = true
}

const onError = () => {
  isLoaded.value = true
}

watch(() => blurhash.value, () => {
  if (blurhash.value) {
    nextTick(() => {
        // Ensure canvas is in DOM
        drawBlurhash()
    })
  }
}, { immediate: true })

onMounted(() => {
    if (blurhash.value) {
        drawBlurhash()
    }
})
</script>
