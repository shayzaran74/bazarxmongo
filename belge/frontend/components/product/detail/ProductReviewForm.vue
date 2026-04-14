<script setup lang="ts">
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/vue/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/vue/24/solid'

interface Props {
  submittingReview: boolean
  reviewDraft: { rating: number, comment: string }
}

defineProps<Props>()
const emit = defineEmits(['submitReview', 'update:reviewDraftRating', 'update:reviewDraftComment'])
</script>

<template>
  <div class="p-8 rounded-3xl bg-white border-2 border-dashed border-slate-200 space-y-6">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
        <ChatBubbleBottomCenterTextIcon class="w-5 h-5" />
      </div>
      <div class="space-y-0.5">
        <h4 class="text-sm font-black text-slate-900 uppercase tracking-tight">
          {{ $t('products.detail.review.writeReview') }}
        </h4>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {{ $t('products.detail.review.shareExperience') }}
        </p>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center gap-2 bg-slate-50 w-fit p-2 rounded-xl border border-slate-100">
        <button
          v-for="i in 5"
          :key="i"
          class="transition-transform active:scale-90"
          @click="emit('update:reviewDraftRating', i)"
        >
          <StarSolidIcon
            class="w-8 h-8 cursor-pointer"
            :class="i <= reviewDraft.rating ? 'text-amber-400' : 'text-slate-200'"
          />
        </button>
      </div>
      <textarea
        :value="reviewDraft.comment"
        class="w-full h-32 p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none placeholder:text-slate-300"
        :placeholder="$t('products.detail.review.textareaPlaceholder')"
        @input="e => emit('update:reviewDraftComment', (e.target as HTMLTextAreaElement).value)"
      />
      <button
        :disabled="submittingReview || !reviewDraft.comment"
        class="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
        @click="emit('submitReview')"
      >
        {{ submittingReview ? 'GÖNDERİLİYOR...' : $t('products.detail.review.submit') }}
      </button>
    </div>
  </div>
</template>
