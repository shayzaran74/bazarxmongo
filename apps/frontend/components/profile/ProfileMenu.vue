<template>
  <div class="bg-white shadow rounded-2xl overflow-hidden mb-6">
    <!-- Mobile Dropdown Selector -->
    <div class="sm:hidden p-4 border-b border-gray-100">
      <div class="relative">
        <button
          class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-left"
          @click="$emit('update:showMobileMenu', !showMobileMenu)"
        >
          <div class="flex items-center">
            <component
              :is="activeTabData?.icon"
              class="h-5 w-5 mr-3 text-primary-600"
            />
            <span class="font-semibold text-gray-800">{{ activeTabData?.name }}</span>
          </div>
          <ChevronDownIcon
            class="h-5 w-5 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': showMobileMenu }"
          />
        </button>
        
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-show="showMobileMenu"
            class="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden"
          >
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['w-full flex items-center px-4 py-3 text-left transition-colors', activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50 text-gray-700']"
              @click="$emit('tabClick', tab.id)"
            >
              <component
                :is="tab.icon"
                class="h-5 w-5 mr-3"
              />
              <span class="font-medium text-sm">{{ tab.name }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Desktop Tabs -->
    <div class="hidden sm:block border-b border-gray-200">
      <nav class="flex overflow-x-auto scrollbar-hide -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['py-4 px-4 lg:px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center', activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          @click="$emit('tabClick', tab.id)"
        >
          <component
            :is="tab.icon"
            class="h-5 w-5 mr-2"
          />
          {{ tab.name }}
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: ''
  },
  activeTabData: {
    type: Object,
    default: () => ({})
  },
  showMobileMenu: Boolean
})

defineEmits(['tabClick', 'update:showMobileMenu'])
</script>
