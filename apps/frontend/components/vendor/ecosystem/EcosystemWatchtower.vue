<template>
  <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
      <h3 class="text-xl font-black text-gray-900 flex items-center gap-2 italic uppercase">
        <MagnifyingGlassCircleIcon class="h-6 w-6 text-indigo-500" />
        Watchtower: Güvenlik Günlüğü
      </h3>
      <div class="px-3 py-1 bg-indigo-50 rounded-lg text-indigo-600 text-[9px] font-black flex items-center gap-1 border border-indigo-100 uppercase italic">
        <div class="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
        LIVE MONITORING
      </div>
    </div>
    <div class="max-h-96 overflow-y-auto">
      <ul class="divide-y divide-gray-50 italic">
        <li v-for="log in logs" :key="log.id" class="p-4 hover:bg-gray-50/50 transition-colors flex gap-4 items-start">
          <div :class="['shrink-0 h-8 w-8 rounded-lg flex items-center justify-center p-1', log.severity === 'CRITICAL' || log.severity === 'WARN' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600']">
            <ExclamationCircleIcon v-if="log.severity === 'CRITICAL' || log.severity === 'WARN'" class="h-5 w-5" />
            <InformationCircleIcon v-else class="h-5 w-5" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <span class="font-black text-xs text-gray-900 uppercase tracking-tight">{{ log.action }}</span>
              <span class="text-[9px] text-gray-400 font-bold uppercase">{{ formatDate(log.createdAt) }}</span>
            </div>
            <div class="mt-1 flex flex-col gap-1.5">
              <div class="text-[10px] text-gray-500 font-bold uppercase">
                <span class="text-indigo-600">{{ log.Vendor?.businessName || 'SİSTEM' }}</span> İÇİN İŞLEM
              </div>
              <div v-if="log.details" class="flex flex-wrap gap-1.5 mt-0.5">
                <div v-for="(val, key) in log.details" :key="key" class="bg-gray-50 border border-gray-100 rounded-md px-2 py-1 text-[9px] text-gray-600 shadow-sm font-black uppercase">
                  <span class="text-gray-400 mr-1.5">{{ key }}:</span>
                  <span>{{ val }}</span>
                </div>
              </div>
            </div>
          </div>
        </li>
        <li v-if="!logs.length" class="p-8 text-center text-gray-300 italic font-black uppercase text-[10px] tracking-widest">
          Ciddi bir aktivite kaydedilmedi.
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
defineProps({ logs: Array })
const formatDate = (d) => new Date(d).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
</script>
