<template>
  <div class="min-h-screen flex items-center justify-center bg-mesh px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
    <!-- Decorative Elements -->
    <div class="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 blur-[120px] rounded-full animate-float" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/10 blur-[120px] rounded-full animate-float" style="animation-delay: -3s" />
    </div>

    <div class="max-w-md w-full space-y-8 relative z-10 transition-all duration-500 animate-slide-up">
      <!-- Logo & Branding -->
      <div class="text-center">
        <div class="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-soft mb-6 hover:scale-105 transition-transform duration-300">
           <span class="text-3xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 italic">
             BAZARX
           </span>
        </div>
        <h2 class="text-3xl font-display font-black tracking-tight text-dark-900 group whitespace-nowrap">
           Ticari Takas Platformu
        </h2>
        <p class="mt-2 text-sm font-medium text-gray-500">
          Geleceğin ticaretine hoş geldiniz.
        </p>
      </div>

      <!-- Auth Card (Glassmorphism) -->
      <div class="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] transition-shadow duration-500">
        <slot />
      </div>

      <!-- Footer -->
      <footer class="text-center space-y-4">
        <div class="flex items-center justify-center space-x-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <NuxtLink to="/legal/privacy" class="hover:text-primary-600 transition-colors">Gizlilik</NuxtLink>
          <NuxtLink to="/legal/terms" class="hover:text-primary-600 transition-colors">Şartlar</NuxtLink>
          <NuxtLink to="/help" class="hover:text-primary-600 transition-colors">Destek</NuxtLink>
        </div>
        <p class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          &copy; 2024 BAZARX. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // Toast bildirimi eklenecek
};
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
