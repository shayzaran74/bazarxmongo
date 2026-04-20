<template>
  <div class="ticari-takas-card-container mb-2">
    <div class="ticari-takas-card group">
      <!-- Card Background Image with 3D Effect -->
      <div class="relative overflow-hidden rounded-2xl shadow-2xl" style="perspective: 1000px;">
        <div class="card-inner relative transform transition-all duration-500 group-hover:rotate-y-5 group-hover:scale-105">
          <img
            src="/images/ticaritakas-card.png"
            alt="TicariTakas Card"
            class="w-full h-auto max-w-md mx-auto drop-shadow-2xl"
          >

          <!-- Balance Overlay on Hover -->
          <div class="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl">
            <div class="text-center">
              <p class="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                💰 Aktif Bakiyeniz
              </p>
              <p class="text-white text-4xl font-black tracking-tight drop-shadow-lg">
                {{ formatPrice(account?.availableBalance || 0) }}
              </p>
              <p v-if="account?.blockedBalance > 0" class="text-red-300 text-sm font-bold mt-2">
                🔒 {{ formatPrice(account.blockedBalance) }} bloke
              </p>
            </div>
          </div>

          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div class="card-shine" />
          </div>
        </div>
      </div>

      <!-- Static Balance Info -->
      <div class="mt-6 flex items-center justify-between bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-orange-900/10 rounded-2xl p-5 border border-purple-200/50 backdrop-blur-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200">
            <span class="text-2xl">💳</span>
          </div>
          <div>
            <h2 class="text-lg font-black text-gray-900 tracking-tight">
              {{ isVendor ? 'TicariTakas Bakiyem' : 'Cüzdan Bakiyesi' }}
            </h2>
            <p class="text-xs text-gray-500 font-medium">Kullanılabilir bakiye</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500">
            {{ formatPrice(account?.availableBalance || 0) }}
          </div>
          <div v-if="account?.blockedBalance > 0" class="mt-1 text-xs font-bold text-red-500">
            🔒 {{ formatPrice(account.blockedBalance) }} bloke edildi
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  account: Object,
  isVendor: Boolean,
  formatPrice: Function
})
</script>

<style scoped>
.ticari-takas-card-container { padding: 1rem; }
.ticari-takas-card { position: relative; }
.card-inner { transform-style: preserve-3d; }
.group:hover .card-inner { transform: rotateY(5deg) scale(1.02); }
.card-shine {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.15) 35%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 65%, transparent 80%);
  animation: shine 2s ease-in-out infinite;
}
@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}
</style>
