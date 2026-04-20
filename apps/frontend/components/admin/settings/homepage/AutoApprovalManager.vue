<template>
  <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-8">
    <div class="p-6 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-lg font-black text-gray-900 flex items-center italic uppercase leading-none">
        <CheckBadgeIcon class="h-5 w-5 mr-2 text-green-600" />
        Otomatik <span class="text-green-600 ml-1">Onaylar</span>
      </h2>
    </div>

    <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div v-for="group in approvalGroups" :key="group.key" class="space-y-4">
        <h3 class="text-xs font-black text-gray-900 uppercase italic opacity-70 flex items-center gap-2 px-1">
          <component :is="group.icon" class="w-4 h-4" /> {{ group.label }}
        </h3>
        <div class="space-y-3">
          <label 
            v-for="opt in options" :key="opt.val"
            class="flex items-center p-4 rounded-2xl cursor-pointer transition-all border group"
            :class="modelValue[group.key] === opt.val ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-transparent hover:border-indigo-200'"
            @click="$emit('update', group.key, opt.val)"
          >
            <div 
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors"
              :class="modelValue[group.key] === opt.val ? 'border-white' : 'border-gray-300'"
            >
              <div v-if="modelValue[group.key] === opt.val" class="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <span class="text-xs font-black uppercase tracking-widest">{{ opt.label }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckBadgeIcon, ClipboardDocumentListIcon, ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'

defineProps({ modelValue: Object })
defineEmits(['update'])

const approvalGroups = [
  { key: 'autoApproveListings', label: 'İlan Onayları', icon: ClipboardDocumentListIcon },
  { key: 'autoApproveOffers', label: 'Teklif Onayları', icon: ArrowsRightLeftIcon }
]

const options = [
  { val: 'none', label: '❌ Manuel Onay' },
  { val: 'verified_companies', label: '🛡️ Sadece Onaylılar' },
  { val: 'all', label: '⚡ Tümü Otomatik' }
]
</script>
