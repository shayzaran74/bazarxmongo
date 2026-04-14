<script setup lang="ts">
import { UserIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/vue/24/solid'
import { useFormat } from '~/composables/useFormat'

import type { Review } from '@barterborsa/shared-types'

interface Props {
  review: Review
}

defineProps<Props>()
const { formatDate } = useFormat()
</script>

<template>
  <div class="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4 transition-all hover:border-indigo-100 hover:shadow-md">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
          <UserIcon class="w-5 h-5" />
        </div>
        <div>
          <h5 class="text-xs font-black text-slate-900 uppercase tracking-tight">
            {{ review.User?.name || 'Anonim Kullanıcı' }}
          </h5>
          <span class="text-[10px] font-bold text-slate-400">{{ formatDate(review.createdAt) }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <StarSolidIcon
          v-for="i in 5"
          :key="i"
          class="w-3.5 h-3.5"
          :class="i <= review.rating ? 'text-amber-400' : 'text-slate-200'"
        />
      </div>
    </div>
    <p class="text-sm text-slate-600 font-medium leading-relaxed pl-1">
      "{{ review.comment }}"
    </p>
    <div
      v-if="review.isVerified"
      class="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit uppercase tracking-tighter"
    >
      <ShieldCheckIcon class="w-3 h-3" />
      DOĞRULANMIŞ SATIN ALMA
    </div>
  </div>
</template>
