<template>
  <div class="space-y-8 p-1">
    <!-- Meta Info Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div class="space-y-4">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kural Kodu
            (Benzersiz)</label>
          <input
            v-model="rule.code"
            type="text"
            placeholder="PREMIUM_PICK"
            class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 uppercase tracking-widest"
          >
        </div>

        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Görünecek Metin
            (Türkçe)</label>
          <input
            v-model="rule.displayText.tr"
            type="text"
            placeholder="Premium Seçim"
            class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
          >
        </div>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label
              class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
            >Pozisyon</label>
            <select
              v-model="rule.position"
              class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="TOP_LEFT">
                Sol Üst
              </option>
              <option value="TOP_RIGHT">
                Sağ Üst
              </option>
              <option value="BOTTOM_LEFT">
                Sol Alt
              </option>
              <option value="BOTTOM_RIGHT">
                Sağ Alt
              </option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Öncelik
              (1-100)</label>
            <input
              v-model.number="rule.priority"
              type="number"
              class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1 text-center">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Arka
              Plan</label>
            <div class="flex items-center gap-2 mt-1">
              <input
                v-model="rule.backgroundColor"
                type="color"
                class="h-10 w-10 border-none bg-transparent cursor-pointer"
              >
              <input
                v-model="rule.backgroundColor"
                type="text"
                class="flex-1 bg-gray-50 border-none rounded-xl px-3 py-2 text-xs font-mono font-bold"
              >
            </div>
          </div>
          <div class="space-y-1 text-center">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Yazı
              Rengi</label>
            <div class="flex items-center gap-2 mt-1">
              <input
                v-model="rule.textColor"
                type="color"
                class="h-10 w-10 border-none bg-transparent cursor-pointer"
              >
              <input
                v-model="rule.textColor"
                type="text"
                class="flex-1 bg-gray-50 border-none rounded-xl px-3 py-2 text-xs font-mono font-bold"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rule Builder Section -->
    <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <FunnelIcon class="h-5 w-5 text-primary-500" />
          Kural Filtreleme Mantığı
        </h3>
        <span
          class="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-wider"
        >
          Vizyoner Rule Builder v1
        </span>
      </div>

      <div class="rule-container bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
        <AdminBadgeConditionNode
          :node="rule.conditionJson"
          :depth="0"
          @update="rule.conditionJson = $event"
        />
      </div>

      <!-- Impact Radius Section -->
      <div class="bg-primary-50 p-4 rounded-2xl flex items-center justify-between border border-primary-100">
        <div class="flex items-center gap-3">
          <div class="bg-white p-2 rounded-xl shadow-sm">
            <MagnifyingGlassCircleIcon class="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest">
              Etki Alanı (Impact
              Radius)
            </p>
            <p
              v-if="impactLoading"
              class="text-sm font-bold text-primary-400 animate-pulse"
            >
              Hesaplanıyor...
            </p>
            <p
              v-else
              class="text-sm font-black text-primary-900"
            >
              Bu kural şu an <span
                class="text-lg underline underline-offset-4 decoration-primary-300"
              >{{ impactCount
              }}</span> ürünü etkileyecek.
            </p>
          </div>
        </div>
        <button
          class="bg-white text-primary-600 px-4 py-2 rounded-xl text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-95 border border-primary-200"
          @click="calculateImpact"
        >
          ŞİMDİ HESAPLA
        </button>
      </div>
    </div>

    <!-- Preview Mockup -->
    <div class="flex justify-center p-8 bg-gray-900 rounded-3xl relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-tr from-primary-900/40 to-transparent pointer-events-none" />
      <div
        class="relative z-10 w-48 h-64 bg-white rounded-2xl shadow-2xl p-3 flex flex-col justify-between overflow-hidden"
      >
        <!-- Mock Badge Overlay -->
        <div
          :class="mockBadgeClass"
          :style="{ backgroundColor: rule.backgroundColor || '#6366f1', color: rule.textColor || '#ffffff' }"
          class="absolute px-2 py-0.5 text-[8px] font-black shadow-lg z-20"
        >
          {{ rule.displayText?.tr || 'ETİKET ÖNİZLEME' }}
        </div>

        <div class="h-32 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          <PhotoIcon class="h-10 w-10 text-gray-200" />
        </div>

        <div class="space-y-2 mt-2">
          <div class="h-3 w-3/4 bg-gray-100 rounded" />
          <div class="h-2 w-1/2 bg-gray-50 rounded" />
          <div class="h-4 w-1/3 bg-primary-100 rounded mt-4" />
        </div>
      </div>
      <p
        class="absolute bottom-4 left-0 right-0 text-center text-white/40 text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none"
      >
        CANLI KART ÖNİZLEMESİ
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect, useApi } from '#imports'
import FunnelIcon from '@heroicons/vue/24/outline/FunnelIcon'
import MagnifyingGlassCircleIcon from '@heroicons/vue/24/outline/MagnifyingGlassCircleIcon'
import PhotoIcon from '@heroicons/vue/24/outline/PhotoIcon'

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['update:modelValue'])

const { $api } = useApi()
const rule = ref({ ...props.modelValue })
const impactCount = ref(0)
const impactLoading = ref(false)

const mockBadgeClass = computed(() => {
    const positions = {
        'TOP_LEFT': 'top-2 left-0 rounded-r-lg',
        'TOP_RIGHT': 'top-2 right-0 rounded-l-lg',
        'BOTTOM_LEFT': 'bottom-2 left-0 rounded-r-lg',
        'BOTTOM_RIGHT': 'bottom-2 right-0 rounded-l-lg'
    }
    return `${positions[rule.value.position] || 'top-2 left-0'}`
})

// Apply background and text color to inline style
watchEffect(() => {
    // We'll use a dynamic ref for the class string or just use style binding in a real scenario
})

const calculateImpact = async () => {
    impactLoading.value = true
    try {
        const data = await $api('/api/admin/badge-rules/preview', {
            method: 'POST',
            body: {
                conditionJson: rule.value.conditionJson,
                targetEcosystem: rule.value.targetEcosystem || ['BAZARX']
            }
        })
        if (data.success) {
            impactCount.value = data.count
        }
    } catch (error) {
        console.error('Impact calculation error:', error)
    } finally {
        impactLoading.value = false
    }
}

watch(rule, (newVal) => {
    emit('update:modelValue', newVal)
}, { deep: true })

</script>

<style scoped>
/* Mock Badge Styles */
:deep(.absolute) {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
}

input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: 8px;
}
</style>
