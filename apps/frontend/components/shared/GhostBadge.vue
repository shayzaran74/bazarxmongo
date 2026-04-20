<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300',
      variantClasses[variant],
      glow && glowClasses[variant],
      customClass
    ]"
  >
    <slot name="icon" />
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  variant?: 'primary' | 'amber' | 'blue' | 'rose' | 'emerald' | 'ghost'
  glow?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  variant: 'primary',
  glow: false,
  customClass: ''
})

const variantClasses = {
  primary: 'bg-primary-600/10 text-primary-600 border-primary-600/20',
  amber: 'bg-amber-400/10 text-amber-500 border-amber-400/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rose: 'bg-rose-600/10 text-rose-500 border-rose-600/20',
  emerald: 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20',
  ghost: 'bg-white/5 text-white/40 border-white/10'
}

const glowClasses = {
  primary: 'shadow-[0_0_15px_rgba(37,99,235,0.1)]',
  amber: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
  blue: 'shadow-[0_0_15px_rgba(59,130,246,0.15)] watchtower-glow-blue',
  rose: 'shadow-[0_0_15px_rgba(225,29,72,0.1)]',
  emerald: 'shadow-[0_0_15px_rgba(5,150,105,0.1)]',
  ghost: 'shadow-[0_0_15px_rgba(255,255,255,0.05)]'
}
</script>
