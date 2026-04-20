<template>
  <div class="space-y-4">
    <div v-if="violations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="v in violations"
        :key="v.id"
        class="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldExclamationIcon class="h-6 w-6" />
            </div>
            <div>
              <h4 class="font-bold text-gray-900">
                {{ v.Brand?.name || 'Bilinmeyen Marka' }}
              </h4>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {{ v.violationType }}
              </p>
            </div>
          </div>
          <span
            :class="getSeverityBadgeClass(v.severity)"
            class="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
          >
            {{ getSeverityLabel(v.severity) }}
          </span>
        </div>

        <p class="text-xs text-gray-600 line-clamp-2 mb-4 italic">
          "{{ v.description || 'Açıklama belirtilmemiş' }}"
        </p>

        <div class="flex gap-2">
          <button
            class="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 py-2.5 rounded-xl text-xs font-bold transition-all"
            @click="$emit('view', v)"
          >
            Detaylı İncele
          </button>
          <button
            v-if="v.status === 'PENDING'"
            class="flex-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all"
            @click="$emit('resolve', v)"
          >
            Hızlı Çöz
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
      <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldCheckIcon class="h-10 w-10 text-green-400" />
      </div>
      <h3 class="text-lg font-bold text-gray-900">
        Hiç İhlal Bildirimi Yok
      </h3>
      <p class="text-sm text-gray-500 text-center max-w-xs mx-auto">
        Harika! Şu an aktif veya bekleyen herhangi bir marka ihlal bildirimi bulunmuyor.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ShieldExclamationIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  violations: {
    type: Array,
    required: true
  }
})

defineEmits(['view', 'resolve'])

const getSeverityBadgeClass = (severity) => {
  switch (severity) {
    case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getSeverityLabel = (severity) => {
  switch (severity) {
    case 'LOW': return 'Düşük'
    case 'MEDIUM': return 'Orta'
    case 'HIGH': return 'Yüksek'
    case 'CRITICAL': return 'Kritik'
    default: return severity || 'Belirsiz'
  }
}
</script>
