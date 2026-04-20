<template>
  <div class="bg-white rounded-2xl shadow-md p-6 border border-orange-100 flex flex-col justify-between h-full">
    <div>
      <h2 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <span>🔄</span> Barter Havuzu
      </h2>
      <div class="space-y-4">
        <div class="p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div class="flex justify-between items-end">
            <div>
              <p class="text-[10px] font-black text-orange-600 uppercase tracking-widest">Havuz Bakiyeniz</p>
              <p class="text-2xl font-black text-orange-700">
                {{ formatPrice(account?.availableBalance || 0) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kredi Limiti</p>
              <p class="text-sm font-bold text-gray-600">
                {{ formatPrice(account?.creditLimit || 0) }}
              </p>
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-500 font-medium leading-relaxed">
          Barter havuzuna nakit bakiyenizden aktarım yaparak takas işlemlerine katılabilir ve ticari ağınızı genişletebilirsiniz.
        </p>
      </div>
    </div>

    <div v-if="!account" class="mt-6 flex flex-col gap-2">
      <button
        class="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-green-200 hover:shadow-green-300 transition-all active:scale-95"
        @click="$emit('register')"
      >
        Havuz Hesabını Etkinleştir
      </button>
      <p class="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tighter">İşlemlere başlamak için hesabı aktif edin</p>
    </div>
    
    <div v-else class="mt-6 flex gap-3">
      <button
        class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95"
        @click="$emit('show-topup')"
      >
        💰 Havuza Aktar
      </button>
      <button
        class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95 disabled:opacity-30"
        :disabled="(account?.availableBalance || 0) <= 0"
        @click="$emit('show-withdraw')"
      >
        💸 Para Çek
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  account: Object,
  formatPrice: Function
})

defineEmits(['register', 'show-topup', 'show-withdraw'])
</script>
