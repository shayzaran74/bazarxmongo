<template>
  <div class="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden mb-10">
    <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
      <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest">
        Son Aktiviteler
      </h3>
      <div
        v-if="loading"
        class="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"
      />
    </div>
    
    <div
      v-if="loading"
      class="p-12 text-center text-gray-400"
    >
      <p class="text-xs font-bold uppercase animate-pulse">
        Veriler Yükleniyor...
      </p>
    </div>
    
    <ul
      v-else-if="activities.length > 0"
      class="divide-y divide-gray-50"
    >
      <li
        v-for="activity in activities"
        :key="activity.id"
        class="px-6 py-5 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
              <BoltIcon class="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900">
                {{ activity.title }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ activity.description }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
              {{ formatDate(activity.createdAt) }}
            </p>
            <span class="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800">
              {{ activity.status }}
            </span>
          </div>
        </div>
      </li>
    </ul>
    
    <div
      v-else
      class="p-12 text-center text-gray-400"
    >
      <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ClockIcon class="h-8 w-8 text-gray-200" />
      </div>
      <p class="text-xs font-bold uppercase">
        Henüz yeni bir aktivite bulunmuyor
      </p>
    </div>
  </div>
</template>

<script setup>
import BoltIcon from '@heroicons/vue/24/outline/BoltIcon'
import ClockIcon from '@heroicons/vue/24/outline/ClockIcon'

defineProps({
  activities: { type: Array, default: () => [] },
  loading: Boolean
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
