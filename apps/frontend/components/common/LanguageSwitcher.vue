<template>
  <div class="relative">
    <button
      class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-all text-[11px] font-bold text-gray-500 uppercase tracking-wider"
      @click="isOpen = !isOpen"
    >
      <GlobeAltIcon class="h-4 w-4 text-primary-400" />
      <span>{{ currentLocaleLabel }}</span>
      <ChevronDownIcon class="h-3 w-3" />
    </button>

    <Transition name="fade">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-40 bg-white shadow-2xl rounded-2xl py-2 border border-gray-100 z-[200] overflow-hidden"
      >
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          :class="[
            'flex items-center w-full px-4 py-2.5 text-[11px] font-bold transition-colors space-x-3',
            loc.code === currentLocale
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
          ]"
          @click="switchLocale(loc.code)"
        >
          <span class="text-base">{{ loc.flag }}</span>
          <span>{{ loc.name }}</span>
          <span
            v-if="loc.code === currentLocale"
            class="ml-auto text-primary-500"
          >✓</span>
        </button>
      </div>
    </Transition>

    <!-- Click outside to close -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[199]"
      @click="isOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GlobeAltIcon from '@heroicons/vue/24/outline/GlobeAltIcon'
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'

interface Locale {
  code: string;
  name: string;
  flag?: string;
}

const { locale, locales, setLocale } = useI18n()

const isOpen = ref(false)

const localeFlags: Record<string, string> = {
  tr: '🇹🇷',
  en: '🇬🇧'
}

const currentLocale = computed(() => locale.value)

const currentLocaleLabel = computed(() => {
  const found = (locales.value as unknown as Locale[]).find(l => l.code === locale.value)
  return found?.name || locale.value.toUpperCase()
})

const availableLocales = computed<Locale[]>(() => {
  return (locales.value as unknown as Locale[]).map(l => ({
    code: l.code,
    name: l.name,
    flag: localeFlags[l.code] || '🌐'
  }))
})

const switchLocale = async (code: string) => {
  await setLocale(code as 'tr' | 'en')
  isOpen.value = false
}
</script>
