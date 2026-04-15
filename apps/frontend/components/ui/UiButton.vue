<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-lg',
      variantClasses[variant],
      sizeClasses[size]
    ]"
    :disabled="loading || disabled"
    v-bind="$attrs"
  >
    <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20',
  secondary: 'bg-white text-dark-950 border border-slate-100 hover:bg-slate-50',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 shadow-none'
}

const sizeClasses = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-6 py-3',
  lg: 'px-8 py-4 text-sm'
}
</script>
