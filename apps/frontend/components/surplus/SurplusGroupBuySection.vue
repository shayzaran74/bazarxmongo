<template>
  <div
    v-if="activeGroupBuy"
    class="w-full bg-indigo-950 py-16 relative overflow-hidden group rounded-[4rem] shadow-2xl border border-indigo-900 shadow-indigo-900/40"
  >
    <!-- Animated background patterns -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-[120px] animate-pulse" />
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse delay-700" />
    </div>

    <div class="max-w-6xl mx-auto px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
      <!-- Left side: Product Visuals -->
      <div class="w-full lg:w-1/2 flex justify-center">
        <div class="relative group-hover:scale-105 transition-transform duration-700">
          <div class="absolute inset-0 bg-primary-500/20 rounded-[3rem] blur-3xl -rotate-6" />
          <ProductImage
            :src="activeGroupBuy.Product?.image"
            :alt="activeGroupBuy.Product?.name"
            class="relative w-48 h-48 md:w-[350px] md:h-[350px]"
            image-class="object-cover rounded-[3rem] shadow-2xl border-4 border-white/10"
          />
          <div
            class="absolute -top-10 -right-10 bg-red-600 text-white font-black text-2xl w-28 h-28 rounded-full flex flex-col items-center justify-center rotate-12 shadow-2xl border-4 border-indigo-900 animate-bounce"
          >
            <span class="text-sm">-%{{ maxDiscount }}</span>
            <span class="text-lg">VARAN</span>
          </div>
        </div>
      </div>

      <!-- Right side: Content -->
      <div class="w-full lg:w-1/2 text-white text-center lg:text-left">
        <div class="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span class="text-xs font-black uppercase tracking-widest">Sınırlı Süreli Fırsat</span>
        </div>

        <h2 class="text-4xl md:text-6xl font-black mb-6 leading-none tracking-tight">
          Birlikte Al, <span class="text-primary-400">Daha Çok Kazanın!</span>
        </h2>

        <p class="text-gray-300 text-xl md:text-2xl mb-10 max-w-lg mx-auto lg:mx-0 font-medium">
          Bu üründe <span class="text-white font-black">%{{ maxDiscount }}'e varan indirim</span> fırsatını kaçırmayın.
          Kalan: <span class="text-primary-400 font-black">{{ activeGroupBuy.remainingQuantity }} adet</span>
        </p>

        <div class="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start mb-10">
          <button
            :disabled="!canJoin"
            class="px-10 py-5 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            @click="$emit('join')"
          >
            Hemen Katıl
          </button>
          <button
            class="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border border-white/20 backdrop-blur-sm transition-all"
            @click="$emit('view')"
          >
            Detayları İncele
          </button>
        </div>

        <div class="flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-400">
          <div class="flex items-center gap-3">
            <span class="text-xl">👥</span>
            <span class="font-black text-white">{{ activeGroupBuy.participantsCount }} katılımcı</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xl">⏳</span>
            <span class="font-black text-white">{{ activeGroupBuy.remainingTime }} kaldı</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activeGroupBuy: Object,
  canJoin: Boolean,
  maxDiscount: Number
})

defineEmits(['join', 'view'])
</script>
