<template>
  <div class="flex items-center gap-2">
    <button
      :disabled="page <= 1"
      class="p-2 rounded-xl border border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-all"
      @click="$emit('change', page - 1)"
    >
      <Icon name="heroicons:chevron-left" class="w-4 h-4" />
    </button>
    
    <div class="flex items-center gap-1">
      <button
        v-for="p in totalPages"
        :key="p"
        :class="[
          'w-10 h-10 rounded-xl text-xs font-black transition-all',
          p === page 
            ? 'bg-primary-600 text-white shadow-lg' 
            : 'text-slate-500 hover:bg-slate-50'
        ]"
        @click="$emit('change', p)"
      >
        {{ p }}
      </button>
    </div>

    <button
      :disabled="page >= totalPages"
      class="p-2 rounded-xl border border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-all"
      @click="$emit('change', page + 1)"
    >
      <Icon name="heroicons:chevron-right" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number
  page: number
  limit: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.limit))
</script>
