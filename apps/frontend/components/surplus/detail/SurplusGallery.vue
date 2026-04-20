<template>
  <div class="space-y-6 italic">
    <div class="aspect-square rounded-[4rem] overflow-hidden bg-white border border-gray-100 shadow-2xl relative group">
      <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      <img :src="activeImage" class="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700" :alt="item.title">
    </div>
    <div v-if="item.images && item.images.length > 1" class="flex gap-5 overflow-x-auto pb-4 scrollbar-hide px-2">
      <button
        v-for="(img, idx) in item.images"
        :key="idx"
        class="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 border-2 transition-all p-1 group relative ring-offset-4"
        :class="activeIdx === idx ? 'border-indigo-600 ring-2 ring-indigo-100 scale-110 shadow-xl' : 'border-transparent bg-white shadow-sm hover:scale-105 opacity-60'"
        @click="$emit('update:activeIdx', idx)"
      >
        <img :src="resolveImageUrl(typeof img === 'string' ? img : img.url)" class="w-full h-full object-cover rounded-2xl">
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ item: Object, activeIdx: Number })
defineEmits(['update:activeIdx'])

const { resolveImageUrl } = useAppImage()
const activeImage = computed(() => {
  if (!props.item?.images || props.item.images.length === 0) return resolveImageUrl(null, 'product')
  const img = props.item.images[props.activeIdx]
  return resolveImageUrl(typeof img === 'string' ? img : img.url)
})
</script>
