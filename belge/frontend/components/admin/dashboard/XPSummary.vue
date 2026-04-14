<template>
  <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
      {{ label }}
    </p>
    <div class="flex items-center justify-between mt-2">
      <span :class="['text-2xl font-black', colorMap[color] || 'text-gray-900']">₺{{ formatPrice(value) }}</span>
      <span
        :class="[
          'text-[10px] px-2 py-0.5 rounded-lg font-black tracking-widest',
          type === 'BRÜT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        ]"
      >
        {{ type }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    default: 0
  },
  color: {
    type: String,
    default: 'indigo'
  },
  type: {
    type: String,
    default: 'BRÜT'
  }
})

const colorMap = {
  indigo: 'text-indigo-600',
  purple: 'text-purple-600',
  blue: 'text-blue-600'
}

const formatPrice = (val) => {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0
  }).format(val || 0)
}
</script>
