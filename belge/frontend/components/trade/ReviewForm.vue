<template>
  <div
    class="relative overflow-hidden bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 p-1 bg-gradient-to-br from-white to-gray-50/50"
  >
    <div class="p-10 space-y-10">
      <!-- Header -->
      <div class="space-y-2">
        <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">
          İŞLEM <span class="text-primary-600">DEĞERLENDİRMESİ</span>
        </h3>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono">
          Professional
          Trading Feedback
        </p>
      </div>

      <!-- Comparison Summary -->
      <div
        class="flex items-center space-x-6 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100/50 shadow-inner"
      >
        <div class="flex -space-x-4">
          <div
            class="w-16 h-16 rounded-2xl bg-white p-1 shadow-sm border border-gray-100 rotate-[-5deg] z-10 overflow-hidden"
          >
            <img
              :src="tradeInfo.fromImage || '/placeholder-surplus.jpg'"
              class="w-full h-full object-cover rounded-xl"
            >
          </div>
          <div
            class="w-16 h-16 rounded-2xl bg-white p-1 shadow-sm border border-gray-100 rotate-[5deg] overflow-hidden"
          >
            <img
              :src="tradeInfo.toImage || '/placeholder-surplus.jpg'"
              class="w-full h-full object-cover rounded-xl"
            >
          </div>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-black text-gray-900 uppercase tracking-tight">
            {{ tradeInfo.partnerName }}
          </h4>
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            İşlem ID: #{{
              tradeInfo.tradeId?.substring(0, 8) }}
          </p>
        </div>
      </div>

      <!-- Rating Section -->
      <div class="space-y-6">
        <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">DENEYİM
          PUANINIZ</label>
        <div
          class="flex items-center justify-between bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          />

          <div class="flex items-center space-x-3 z-10">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="group/star relative p-1 transition-all active:scale-90"
              @click="rating = star"
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
            >
              <StarIcon
                class="h-10 w-10 transition-all duration-300"
                :class="[
                  (hoverRating || rating) >= star
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)] scale-110'
                    : 'text-gray-200 group-hover/star:text-amber-200'
                ]"
              />
            </button>
          </div>

          <div class="text-right z-10">
            <p class="text-2xl font-black text-gray-900 italic leading-none">
              {{ ratingLabels[rating ||
                hoverRating] || '---' }}
            </p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
              Puanlama
            </p>
          </div>
        </div>
      </div>

      <!-- Comment Section -->
      <div class="space-y-4">
        <label class="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">DETAYLI
          GÖRÜŞÜNÜZ</label>
        <div class="relative">
          <textarea
            v-model="comment"
            rows="5"
            class="w-full bg-white border border-gray-100 rounded-[2.5rem] px-8 py-8 text-sm font-medium text-gray-600 placeholder-gray-300 focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all shadow-sm resize-none italic"
            placeholder="İşlem süreci, iletişim ve ürün kalitesi hakkında detaylı bilgi verin..."
          />
          <div
            class="absolute bottom-6 right-8 text-[9px] font-black"
            :class="comment.length > 500 ? 'text-red-500' : 'text-gray-300'"
          >
            {{ comment.length }} / 500
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          class="bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-[1.5rem] py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm"
          @click="$emit('cancel')"
        >
          DAHA SONRA
        </button>
        <button
          :disabled="!rating || submitting"
          class="relative bg-gray-900 hover:bg-black text-white rounded-[1.5rem] py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl disabled:opacity-30 disabled:grayscale overflow-hidden group"
          @click="submitReview"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          />
          <span v-if="!submitting">DEĞERLENDİRMEYİ TAMAMLA</span>
          <span
            v-else
            class="flex items-center justify-center"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2 animate-spin" />
            GÖNDERİLİYOR...
          </span>
        </button>
      </div>
    </div>

    <!-- Success Overlay -->
    <div
      v-if="showSuccess"
      class="absolute inset-0 bg-white/80 backdrop-blur-md z-[50] flex flex-col items-center justify-center p-10 text-center animate-fade-in"
    >
      <div
        class="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primary-600/40 animate-bounce-slow"
      >
        <CheckIcon class="h-12 w-12 text-white stroke-[3]" />
      </div>
      <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest italic mb-4">
        TEŞEKKÜRLER!
      </h3>
      <p class="text-sm font-bold text-gray-500 uppercase tracking-widest max-w-[280px]">
        Değerlendirmeniz sisteme
        başarıyla kaydedildi.
      </p>
    </div>
  </div>
</template>

<script setup>
import { StarIcon, ArrowPathIcon, CheckIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
    tradeInfo: {
        type: Object,
        required: true,
        // Expected: { tradeId, partnerName, fromImage, toImage, toUserId }
    }
})

const emit = defineEmits(['success', 'cancel'])

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const submitting = ref(false)
const showSuccess = ref(false)

const ratingLabels = {
    1: 'ÇOK KÖTÜ',
    2: 'ZAYIF',
    3: 'ORTA',
    4: 'İYİ',
    5: 'MÜKEMMEL'
}

const submitReview = async () => {
    if (!rating.value || submitting.value) return

    if (!props.tradeInfo.toUserId) {
        const toast = useNuxtApp().$toast
        toast.error('İlgili firmanın yetkili kullanıcısı bulunamadı. Lütfen destek ile iletişime geçin.')
        return
    }

    submitting.value = true
    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    try {
        const response = await $fetch('/api/trade-reviews', {
            method: 'POST',
            baseURL: config.public.apiBase,
            headers: { Authorization: `Bearer ${authStore.token}` },
            body: {
                tradeOfferId: props.tradeInfo.tradeId,
                toUserId: props.tradeInfo.toUserId,
                rating: rating.value,
                comment: comment.value
            }
        })

        if (response.success) {
            showSuccess.value = true
            setTimeout(() => {
                emit('success', response.data)
            }, 2000)
        }
    } catch (error) {
        console.error('Submit review error:', error);
        if (error.data) {
            console.error('Error data:', error.data);
        }
        const toast = useNuxtApp().$toast
        toast.error(error.data?.error || 'Değerlendirme gönderilirken bir hata oluştu.')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.tracking-tightest {
    letter-spacing: -0.05em;
}

.animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
}

.animate-bounce-slow {
    animation: bounceSlow 3s infinite ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes bounceSlow {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}
</style>
