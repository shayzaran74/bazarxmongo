<template>
  <div
    v-if="items.length > 0"
    class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-2"
  >
    <div class="flex justify-start md:justify-center md:gap-8 overflow-x-auto pb-4 hide-scrollbar snap-x">
      <NuxtLink
        v-for="(item, idx) in items"
        :key="idx"
        :to="item.path"
        class="flex flex-col items-center gap-2 group min-w-[75px] snap-center"
      >
        <div
          :class="['w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 bg-gradient-to-br', item.colorFrom, item.colorTo, item.shadowColor]"
        >
          <div class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <component
            :is="getIconComponent(item.icon)"
            v-if="getIconComponent(item.icon)"
            class="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <span
          :class="['text-xs font-black text-slate-700 transition-colors uppercase tracking-tight', item.hoverColor]"
        >{{
          item.title }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CurrencyDollarIcon,
  TagIcon,
  ShoppingBagIcon,
  FireIcon,
  RectangleGroupIcon,
  StarIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  UsersIcon,
  TruckIcon,
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  ArrowsRightLeftIcon,
  TicketIcon,
  UserGroupIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline'
import type { FunctionalComponent, SVGAttributes } from 'vue'

export interface QuickMenuItem {
  title: string
  path: string
  icon: string
  colorFrom: string
  colorTo: string
  shadowColor: string
  hoverColor: string
}

defineProps<{
  items: QuickMenuItem[]
}>()

const getIconComponent = (iconName: string) => {
  const icons: Record<string, FunctionalComponent<SVGAttributes> | null> = {
    CurrencyDollarIcon,
    TagIcon,
    ShoppingBagIcon,
    FireIcon,
    RectangleGroupIcon,
    StarIcon,
    AcademicCapIcon,
    CheckBadgeIcon,
    UsersIcon,
    TruckIcon,
    BuildingOffice2Icon,
    ClipboardDocumentCheckIcon,
    ArrowsRightLeftIcon,
    TicketIcon,
    UserGroupIcon,
    SparklesIcon,
    QuestionMarkCircleIcon,
    GlobeAltIcon
  }
  return icons[iconName] || null
}
</script>
