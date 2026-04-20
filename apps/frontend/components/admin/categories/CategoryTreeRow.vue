<template>
  <tr 
    :class="[
      'cursor-pointer transition-all hover:bg-gray-50 border-gray-100',
      level === 0 ? 'bg-indigo-50/30' : level === 1 ? 'border-l-4 border-indigo-200' : 'bg-gray-50 border-l-8 border-gray-200'
    ]"
    @click="$emit('toggle')"
  >
    <td class="px-6 py-4" :style="{ paddingLeft: `${level * 2 + 1.5}rem` }">
      <div class="flex items-center">
        <div class="mr-3 text-gray-400">
          <ChevronRightIcon v-if="hasChildren && !isExpanded" class="h-4 w-4" />
          <ChevronDownIcon v-else-if="hasChildren && isExpanded" class="h-4 w-4" />
          <span v-else-if="level === 2" class="text-gray-300 font-black italic mr-1">↳</span>
          <div v-else class="h-4 w-4" />
        </div>
        
        <div class="mr-3 p-2 bg-white rounded-xl shadow-sm" v-if="level < 2">
          <component :is="getIcon(category.icon)" class="h-5 w-5 text-indigo-600" />
        </div>

        <div>
          <div :class="['font-black uppercase tracking-tight italic leading-none mb-1', level === 0 ? 'text-sm text-gray-900' : 'text-xs text-gray-700']">
            {{ category.name }}
          </div>
          <div class="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{{ category.slug }}</div>
        </div>
      </div>
    </td>

    <td class="px-6 py-4">
      <span :class="['px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border', typeConfig.class]">
        {{ typeConfig.label }}
      </span>
    </td>

    <td class="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-tight italic">
      {{ category._count?.children || 0 }} ALT GRUP
    </td>

    <td class="px-6 py-4 text-[11px] font-black text-gray-900 uppercase italic">
      {{ category._count?.CatalogProduct || 0 }} ÜRÜN
    </td>

    <td class="px-6 py-4">
      <span v-if="category.badgeText" class="px-2 py-0.5 rounded text-[8px] font-black text-white uppercase shadow-sm" :style="{ backgroundColor: category.badgeColor || '#ef4444' }">
        {{ category.badgeText }}
      </span>
      <span v-else class="text-[9px] font-bold text-gray-300 uppercase italic">Yok</span>
    </td>

    <td class="px-6 py-4">
      <span :class="['px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest', category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400']">
        {{ category.isActive ? 'Aktif' : 'Pasif' }}
      </span>
    </td>

    <td class="px-6 py-4 text-right space-x-3">
      <NuxtLink :to="`/admin/categories/${category.id}/attributes`" class="text-[10px] font-black text-indigo-600 hover:text-indigo-900 uppercase tracking-widest" @click.stop>
        ÖZELLİKLER
      </NuxtLink>
      <button class="text-[10px] font-black text-indigo-600 hover:text-indigo-900 uppercase tracking-widest" @click.stop="$emit('edit')">
        DÜZENLE
      </button>
      <button class="text-[10px] font-black text-red-400 hover:text-red-700 uppercase tracking-widest" @click.stop="$emit('delete')">
        SİL
      </button>
    </td>
  </tr>
</template>

<script setup>
import * as Icons from '@heroicons/vue/24/outline'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  category: Object,
  level: { type: Number, default: 0 },
  isExpanded: Boolean
})

defineEmits(['toggle', 'edit', 'delete'])

const hasChildren = computed(() => props.category._count?.children > 0 || (props.category.children?.length > 0))

const typeConfig = computed(() => {
  if (props.level === 0) return { label: 'ANA GRUP', class: 'bg-indigo-600 text-white border-indigo-400' }
  if (props.level === 1) return { label: 'ALT GRUP', class: 'bg-white text-indigo-600 border-indigo-100' }
  return { label: 'DETAY', class: 'bg-gray-50 text-gray-500 border-gray-200' }
})

const getIcon = (name) => Icons[name] || Icons.FolderIcon
</script>
