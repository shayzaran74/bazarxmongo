<template>
  <div class="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-purple-500/30">
    <!-- Animated Background Gradients -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s;"></div>

    <!-- Main Content Card -->
    <div class="z-10 w-full max-w-md p-8 text-center">
      <!-- Logo / Icon -->
      <div class="mb-8 relative inline-block group">
        <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div class="relative bg-[#0F172A] p-5 rounded-full border border-white/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white animate-spin-slow">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
      </div>

      <!-- Heading -->
      <h1 class="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
        BarterBorsa <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Yakında</span>
      </h1>
      <p class="text-slate-400 text-lg mb-10 font-medium leading-relaxed">
        Türkiye'nin en güçlü kurumsal takas ekosistemi yayına hazırlanıyor.
      </p>

      <!-- Password Input Section -->
      <div class="space-y-4">
        <div class="relative group">
          <input 
            v-model="password" 
            @keyup.enter="handleAccess"
            type="password" 
            placeholder="Erişim Şifresi"
            class="w-full bg-white/5 border border-white/10 text-white px-5 py-4 rounded-2xl outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-center placeholder:text-slate-600 text-lg tracking-widest"
          />
          <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-purple-400 transition-colors pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
        </div>

        <button 
          @click="handleAccess"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
        >
          <span v-if="!isLoading" class="relative z-10">Giriş Yap</span>
          <div v-else class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          
          <!-- Hover Glow Effect -->
          <div class="absolute top-0 -left-[100%] w-full h-full bg-white/20 skew-x-[-20deg] group-hover:left-[100%] transition-all duration-700"></div>
        </button>

        <!-- Error Message -->
        <Transition name="fade">
          <p v-if="error" class="text-red-400 text-sm font-semibold mt-3 flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            {{ error }}
          </p>
        </Transition>
      </div>

      <!-- Footer -->
      <div class="mt-16 text-slate-600 text-sm font-medium">
        © 2026 BarterBorsa Ecosystem. Tüm hakları saklıdır.
      </div>
    </div>

    <!-- Floating Particles Decoration -->
    <div v-for="i in 5" :key="i" 
      class="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
      :style="{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${5 + Math.random() * 10}s`
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const router = useRouter()

// Nuxt Cookie Manager
const accessCookie = useCookie('maintenance_bypass', {
  maxAge: 60 * 60 * 24 * 7, // 1 hafta geçerli
  path: '/'
})

const handleAccess = async () => {
  if (!password.value) {
    error.value = 'Lütfen bir şifre girin.'
    return
  }

  isLoading.value = true
  error.value = ''

  // Yapay gecikme (estetik için)
  await new Promise(resolve => setTimeout(resolve, 800))

  if (password.value === 'shayzaran74') {
    accessCookie.value = 'authorized'
    router.push('/')
  } else {
    error.value = 'Hatalı şifre. Lütfen tekrar deneyin.'
    password.value = ''
  }
  
  isLoading.value = false
}

// SEO & Layout
definePageMeta({
  layout: false
})

useHead({
  title: 'BarterBorsa | Yakında Hizmetinizde',
  meta: [
    { name: 'description', content: 'Türkiye\'nin en güçlü kurumsal takas ekosistemi yakında yayında.' }
  ]
})
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0% { transform: translateY(0px) translateX(0px); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
}

.animate-float {
  animation: float linear infinite;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
