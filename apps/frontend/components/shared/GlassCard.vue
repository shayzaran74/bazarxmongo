<template>
  <div
    :class="[
      'relative overflow-hidden transition-all duration-300',
      variantClasses[variant],
      glow && glowClasses[variant],
      customClass
    ]"
  >
    <!-- Optional Decorative Gradients -->
    <div
      v-if="accent"
      class="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
      :class="accentClasses[variant]"
    />
    
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'light' | 'dark' | 'watchtower' | 'amber'
  glow?: boolean
  accent?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'light',
  glow: false,
  accent: false,
  customClass: ''
})

const variantClasses = {
  light: 'glass rounded-[2.5rem]',
  dark: 'glass-dark rounded-[2.5rem]',
  watchtower: 'watchtower-glass rounded-[3rem]',
  amber: 'bg-amber-400/5 backdrop-blur-xl border border-amber-400/20 rounded-[2.5rem]'
}

const glowClasses = {
  light: 'shadow-xl',
  dark: 'shadow-neon',
  watchtower: 'watchtower-glow-blue',
  amber: 'watchtower-glow-amber'
}

const accentClasses = {
  light: 'bg-primary-500',
  dark: 'bg-blue-600',
  watchtower: 'bg-indigo-600',
  amber: 'bg-amber-500'
}
</script>
