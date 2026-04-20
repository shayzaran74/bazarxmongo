<template>
  <aside class="w-64 bg-gray-900 text-white flex flex-col">
    <!-- Logo -->
    <div class="p-4 border-b border-gray-800">
      <NuxtLink to="/admin" class="flex items-center space-x-2">
        <span class="text-2xl">🏭</span>
        <span class="text-lg font-semibold">TicariTakas</span>
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="p-4">
      <div class="relative">
        <input
          type="text"
          placeholder="Ara (⌘K)"
          class="w-full bg-gray-800 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-2 space-y-6 pb-20 custom-scrollbar">
      <div v-for="section in navigation" :key="section.title || 'main'" class="space-y-1">
        <p v-if="section.title" class="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          {{ section.title }}
        </p>

        <div v-for="item in section.items" :key="item.to || item.label">
          <!-- Normal Link -->
          <NuxtLink
            v-if="!item.children"
            :to="item.to"
            class="group flex items-center px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200"
            :class="[
              route.path === item.to || (item.activePath && route.path.startsWith(item.activePath))
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
            <span class="truncate">{{ item.label }}</span>
          </NuxtLink>

          <!-- Collapsible Menu -->
          <div v-else class="space-y-1">
            <button
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
              @click="item.isOpen = !item.isOpen"
            >
              <div class="flex items-center">
                <component :is="item.icon" class="h-5 w-5 mr-3" />
                <span>{{ item.label }}</span>
              </div>
              <ChevronDownIcon
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': item.isOpen }"
              />
            </button>
            <div v-show="item.isOpen" class="pl-4 space-y-1">
              <NuxtLink
                v-for="child in item.children"
                :key="child.to"
                :to="child.to"
                class="flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-colors"
                :class="[
                  route.path === child.to ? 'text-primary-400 bg-primary-400/10' : 'text-gray-500 hover:text-white hover:bg-gray-800'
                ]"
              >
                <component :is="child.icon" v-if="child.icon" class="h-4 w-4 mr-3" />
                {{ child.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- User Menu -->
    <div class="p-4 border-t border-gray-800 bg-gray-950/50 backdrop-blur-md">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 overflow-hidden">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
            {{ fullName.charAt(0) || 'A' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-black text-white truncate">{{ fullName || 'Admin' }}</p>
            <p class="text-[10px] font-bold text-gray-500 truncate capitalize">{{ userRole || 'Yönetici' }}</p>
          </div>
        </div>
        <button class="p-2 text-gray-400 hover:text-rose-400 transition-colors" title="Çıkış Yap" @click="$emit('logout')">
          <ArrowRightOnRectangleIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { NavSection } from '~/composables/useAdminNavigation'

defineProps<{
  navigation: NavSection[]
  fullName: string
  userRole?: string
}>()

defineEmits<{ (e: 'logout'): void }>()

const route = useRoute()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
</style>
