<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section class="relative pt-20 pb-32 overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full bg-[#0a0a0c] z-0" />
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/20 to-transparent z-0" />
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-600 rounded-full blur-[120px] opacity-20 z-0" />

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div class="flex-1 text-center lg:text-left">
            <div
              class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6"
            >
              <StarIcon class="h-5 w-5 text-primary-400" />
              <span class="text-primary-100 text-sm font-bold tracking-widest uppercase italic">Ayrıcalıklı Dünya</span>
            </div>
            <h1 class="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-none">
              TicariTakas <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-amber-400 to-primary-500"
              >Premium</span>
            </h1>
            <p class="text-xl text-gray-400 font-medium mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Üyelerine özel fırsatların ve hizmetlerin sunulduğu bir avantajlar dünyası. Alışveriş keyfini zirvede
              yaşayın.
            </p>
            <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                class="px-10 py-5 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-600/30 hover:bg-primary-500 hover:-translate-y-1 transition-all active:scale-95"
                @click="scrollToPricing"
              >
                HEMEN PREMİUM'LU OL ✨
              </button>
              <div class="flex -space-x-3">
                <div
                  v-for="i in 4"
                  :key="i"
                  :class="['w-12 h-12 rounded-full border-4 border-[#0a0a0c] bg-gray-800 flex items-center justify-center text-xs font-bold text-white', i === 4 ? 'bg-primary-600' : '']"
                >
                  <span v-if="i === 4">+10k</span>
                  <UserIcon
                    v-else
                    class="h-5 w-5"
                  />
                </div>
              </div>
              <span class="text-gray-400 text-sm font-bold ml-2">10.000+ Aktif Üye</span>
            </div>
          </div>

          <!-- Hero Image/Graphic - TicariTakas Card -->
          <div class="flex-1 w-full max-w-lg lg:max-w-xl relative group">
            <!-- Glow Effect -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-orange-500 rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-pulse"
            />

            <!-- Card Container with 3D Effect -->
            <div
              class="relative"
              style="perspective: 1200px;"
            >
              <div
                class="premium-card-3d transform transition-all duration-700 group-hover:rotate-y-12 group-hover:scale-105"
              >
                <!-- Card Image -->
                <img
                  src="/images/ticaritakas-card.png"
                  alt="TicariTakas Bakiyesi Premium Card"
                  class="w-full h-auto drop-shadow-2xl rounded-2xl"
                >

                <!-- Shine Animation Overlay -->
                <div
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-2xl overflow-hidden"
                >
                  <div class="premium-card-shine" />
                </div>

                <!-- Floating Particles -->
                <div class="absolute -inset-4 pointer-events-none">
                  <div class="absolute top-4 left-8 w-2 h-2 bg-amber-400 rounded-full animate-float-1 opacity-60" />
                  <div class="absolute top-12 right-12 w-3 h-3 bg-purple-400 rounded-full animate-float-2 opacity-50" />
                  <div class="absolute bottom-8 left-24 w-2 h-2 bg-indigo-400 rounded-full animate-float-3 opacity-70" />
                  <div
                    class="absolute bottom-16 right-8 w-1.5 h-1.5 bg-orange-400 rounded-full animate-float-1 opacity-60"
                  />
                </div>
              </div>
            </div>

            <!-- Card Holder Info Below -->
            <div class="mt-8 text-center lg:text-left">
              <div
                class="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
              >
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg"
                >
                  <StarIcon class="h-6 w-6 text-white fill-white" />
                </div>
                <div class="text-left">
                  <div class="text-[0.625rem] text-primary-400 font-black uppercase tracking-widest">
                    KART SAHİBİ
                  </div>
                  <div class="text-white font-bold text-sm uppercase tracking-wide">
                    DEĞERLİ MÜŞTERİMİZ
                  </div>
                  <div class="text-white font-bold text-sm uppercase tracking-wide">
                    {{ authStore.fullName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase italic">
            Öne Çıkan Ayrıcalıklar
          </h2>
          <div class="w-24 h-2 bg-primary-600 mx-auto rounded-full" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-10 bg-gray-50 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-gray-200 transition-all group border border-transparent hover:border-gray-100"
          >
            <div
              :class="['w-20 h-20 rounded-3xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110 duration-500', feature.colorClass]"
            >
              <component
                :is="feature.icon"
                class="h-10 w-10 text-white"
              />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-4 uppercase italic tracking-tighter leading-none">
              {{
                feature.title }}
            </h3>
            <p class="text-gray-500 font-medium leading-relaxed">
              {{ feature.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Cashback Details (TicariPara) -->
    <section class="py-24 bg-gray-50 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="bg-white rounded-[3rem] p-8 lg:p-16 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col lg:flex-row gap-16 items-center"
        >
          <div class="flex-1">
            <h2 class="text-4xl font-black text-gray-900 mb-8 tracking-tighter leading-none italic uppercase">
              TicariTakas <br>
              <span class="text-primary-600">Kazanç Detayları</span>
            </h2>
            <div class="space-y-6 mb-10">
              <div
                v-for="info in cashbackInfo"
                :key="info.id"
                class="flex items-start gap-4"
              >
                <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckIcon class="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 class="font-black text-gray-900 text-lg mb-1 leading-none italic">
                    {{ info.title }}
                  </h4>
                  <p class="text-gray-500 font-medium text-sm leading-relaxed">
                    {{ info.text }}
                  </p>
                </div>
              </div>
            </div>
            <div class="inline-flex items-center gap-4 p-4 bg-primary-50 rounded-2xl border border-primary-100">
              <div
                class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200"
              >
                <InformationCircleIcon class="h-6 w-6 text-white" />
              </div>
              <div>
                <div class="text-xs font-black text-primary-600 uppercase tracking-widest">
                  Limit Bilgisi
                </div>
                <div class="text-lg font-black text-gray-900 leading-tight">
                  Aylık 3.500 TL’ye kadar kazanç
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 grid grid-cols-2 gap-4 w-full">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="p-8 bg-gray-50 rounded-3xl text-center group hover:bg-primary-600 transition-all duration-500"
            >
              <div
                class="text-4xl font-black text-primary-600 mb-2 group-hover:text-white transition-colors tracking-tighter italic"
              >
                {{ stat.value }}
              </div>
              <div class="text-xs font-black text-gray-400 group-hover:text-primary-100 uppercase tracking-widest">
                {{
                  stat.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">
            Premium Üyelik Aktif Et
          </h2>
          <p class="text-gray-500 font-bold">
            Premium üyelik sadece 3 adımda aktif!
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          <!-- Connector line for desktop -->
          <div class="hidden lg:block absolute top-10 left-32 right-32 h-1 bg-gray-100 z-0" />

          <div
            v-for="(step, index) in steps"
            :key="index"
            class="relative z-10 flex flex-col items-center text-center"
          >
            <div
              class="w-20 h-20 rounded-full bg-white border-4 border-primary-600 flex items-center justify-center text-3xl font-black text-primary-600 mb-6 shadow-xl shadow-primary-100"
            >
              {{ index + 1 }}
            </div>
            <h4 class="text-xl font-black text-gray-900 mb-3 uppercase italic">
              {{ step.title }}
            </h4>
            <p class="text-gray-500 font-medium text-sm leading-relaxed max-w-xs">
              {{ step.desc }}
            </p>
          </div>
        </div>

        <!-- Warning Area -->
        <div class="mt-20 max-w-4xl mx-auto flex flex-col md:flex-row gap-6">
          <div class="flex-1 bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center gap-4">
            <InformationCircleIcon class="h-8 w-8 text-blue-600 flex-shrink-0" />
            <p class="text-blue-900 text-sm font-bold leading-snug">
              Hızlı aktivasyon için lütfen cüzdanınızda yeterli
              bakiye olduğundan emin olun.
            </p>
          </div>
          <div class="flex-1 bg-primary-50 border border-primary-100 p-6 rounded-3xl flex items-center gap-4">
            <WalletIcon class="h-8 w-8 text-primary-600 flex-shrink-0" />
            <p class="text-primary-900 text-sm font-bold leading-snug">
              Ödeme, TicariTakas cüzdan bakiyenizden otomatik
              olarak tahsil edilir.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Plans -->
    <section
      id="pricing"
      class="py-24 bg-gray-900 relative overflow-hidden"
    >
      <!-- Decorative background -->
      <div class="absolute top-0 left-0 w-full h-full opacity-10">
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[62.5rem] h-[62.5rem] border border-white rounded-full"
        />
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] border border-white rounded-full"
        />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-20">
          <h2 class="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
            Planını Seç,
            <span class="text-primary-400">Avantajlarını Katla!</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <!-- Monthly Plan -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"
            />
            <div
              class="relative flex flex-col h-full p-10 bg-gray-800 border border-gray-700 rounded-[2.5rem] hover:border-primary-500 transition-all overflow-hidden"
            >
              <div class="absolute top-0 right-0 p-8 h-32 w-32 bg-primary-600/10 rounded-full blur-3xl" />

              <div class="mb-8">
                <h3 class="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
                  AYLIK PREMIUM
                </h3>
                <p class="text-gray-400 text-sm font-medium">
                  Üyeliğin ilk ayı sana özel fırsat!
                </p>
              </div>

              <div class="flex items-baseline gap-2 mb-8">
                <span class="text-gray-500 line-through text-2xl font-bold">199,00 TL</span>
                <span class="text-6xl font-black text-white tracking-tighter">99,00 <span
                  class="text-xl"
                >TL</span></span>
              </div>

              <p class="text-gray-400 text-sm font-bold mb-10 italic">
                Sonraki aylar 99,00 TL/ay
              </p>

              <button
                class="mt-auto w-full py-5 bg-white text-gray-900 rounded-2xl font-black text-lg hover:bg-primary-50 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                @click="startPremium('monthly')"
              >
                PREMİUM'A GEÇ 🚀
              </button>
            </div>
          </div>

          <!-- Yearly Plan -->
          <div class="relative group">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-primary-600 to-amber-600 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"
            />
            <div
              class="relative flex flex-col h-full p-10 bg-[#0a0a0c] border border-primary-500 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <!-- Recomended Badge -->
              <div
                class="absolute top-6 right-6 bg-amber-400 text-black text-[0.625rem] font-black tracking-widest px-4 py-2 rounded-full shadow-lg"
              >
                ÖNERİLEN 🔥
              </div>

              <div class="mb-8">
                <h3 class="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
                  YILLIK PREMIUM
                </h3>
                <p class="text-primary-400 text-sm font-bold">
                  Yıl boyunca üyeliğin ayda sadece
                </p>
              </div>

              <div class="flex items-baseline gap-2 mb-8">
                <span class="text-gray-500 line-through text-2xl font-bold">1.490,00 TL</span>
                <span class="text-6xl font-black text-white tracking-tighter">69,00 <span
                  class="text-xl"
                >TL</span></span>
              </div>

              <div class="space-y-4 mb-10">
                <p class="text-primary-400 text-sm font-black italic uppercase tracking-widest">
                  YILLIK TOPLAM 1.068,00
                  TL
                </p>
                <div class="flex items-center gap-2 text-white text-sm font-bold">
                  <span class="p-1 bg-green-500 rounded-md">✅</span>
                  %50 Daha Avantajlı!
                </div>
              </div>

              <button
                class="mt-auto w-full py-5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:shadow-primary-600/50 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                @click="startPremium('yearly')"
              >
                ŞİMDİ YILLIK GEÇ 👑
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section (Optional Mini) -->
    <section class="py-24 bg-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl font-black text-gray-900 mb-8 uppercase italic tracking-tighter">
          Hala Bir Sorum Var?
        </h2>
        <NuxtLink
          to="/support"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-all"
        >
          Müşteri Hizmetlerine Sor
          <ChevronRightIcon class="h-5 w-5" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  StarIcon,
  TruckIcon,
  TvIcon,
  WalletIcon,
  CheckIcon,
  InformationCircleIcon,
  UserIcon,
  ChevronRightIcon,
    
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const scrollToPricing = () => {
  const el = document.getElementById('pricing')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const startPremium = async (plan: 'monthly' | 'yearly') => {
  if (!authStore.isLoggedIn) {
    useNuxtApp().$toast.info('Lütfen önce giriş yapın')
    return navigateTo('/login?redirect=/premium')
  }

  const amount = plan === 'monthly' ? 99.00 : 89.00 * 12

  try {
    const { $api } = useApi()
    const response = await $api('/api/payments/premium/subscribe', {
      method: 'POST',
      body: {
        plan,
        amount
      }
    }) as { success: boolean; message: string }

    if (response.success) {
      useNuxtApp().$toast.success(response.message)
      // Refresh user data to update isPremium status
      await authStore.fetchUser()
      // Optional: redirect to home or dashboard
      setTimeout(() => navigateTo('/'), 2000)
    }
  } catch (error: unknown) {
    console.error('Premium subscription error:', error)
    const err = error as { data?: { error?: string } }
    useNuxtApp().$toast.error(err.data?.error || 'Ödeme işlemi sırasında bir hata oluştu')
  }
}

const features = [
  {
    title: 'Ücretsiz Kargo',
    desc: 'TicariTakas Premium ile binlerce üründe alt limit olmaksızın ücretsiz kargo avantajından faydalanın.',
    icon: TruckIcon,
    colorClass: 'bg-primary-600 shadow-xl shadow-primary-200'
  },
  {
    title: 'Hediye Kartı ile indirimler',
    desc: 'Premium üyeliğiniz boyunca binlerce ürün ücretsiz indirim avantajından faydalanın.',
    icon: TvIcon,
    colorClass: 'bg-indigo-600 shadow-xl shadow-indigo-200'
  },
  {
    title: 'TicariTakas Kazancı',
    desc: 'Alışverişlerinizden TicariBakiyesi kazanın, kazandıklarınızı bir sonraki siparişinizde harcayın.',
    icon: WalletIcon,
    colorClass: 'bg-amber-600 shadow-xl shadow-amber-200'
  }
]

const cashbackInfo = [
  {
    id: 1,
    title: 'Standart Alışverişlerde %3 Kazanç',
    text: 'Tüm standart alışverişlerinizde %3 TicariTakas kazanırsınız. (Sipariş başına en fazla 25 TL).'
  },
  {
    id: 2,
    title: 'Özel Ürünlerde %8 - %10 Kazanç',
    text: 'Belirli ürünlerde kazanç oranı %8 veya %10’a çıkar. Bu ürünlerde sipariş başına sınırlama yoktur.'
  },
  {
    id: 3,
    title: 'Özgür Kullanım',
    text: 'Kazandığınız bakiyeleri herhangi bir limit veya alt sınır olmaksızın anında harcayabilirsiniz.'
  }
]

const stats = [
  { value: '%3', label: 'STANDART KAZANÇ' },
  { value: '%10', label: 'MAX KAZANÇ' },
  { value: '3.500₺', label: 'AYLIK LİMİT' },
  { value: '∞', label: 'HARCAMA LİMİTİ' }
]

const steps = [
  {
    title: 'Planını Belirle',
    desc: 'İhtiyacına en uygun Premium planını seç ve "Premium\'a Geç" butonuna tıkla.'
  },
  {
    title: 'Cüzdan Bakiyeni Kontrol Et',
    desc: 'Ödemen TicariTakas cüzdanından alınacaktır. Yeterli bakiyen olduğundan emin ol.'
  },
  {
    title: 'Ayrıcalığa Başla',
    desc: 'İşlemi tamamla ve pırlanta logolu yeni üye kartınla avantajların tadını çıkar!'
  }
]
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Premium Card 3D Effect */
.premium-card-3d {
  transform-style: preserve-3d;
}

.group:hover .premium-card-3d {
  transform: rotateY(8deg) scale(1.05);
}

/* Premium Card Shine Effect */
.premium-card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
      transparent 15%,
      rgba(255, 255, 255, 0.1) 30%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0.1) 70%,
      transparent 85%);
  animation: premium-shine 3s ease-in-out infinite;
}

@keyframes premium-shine {
  0% {
    transform: translateX(-150%) translateY(-150%) rotate(45deg);
  }

  100% {
    transform: translateX(150%) translateY(150%) rotate(45deg);
  }
}

/* Floating Particle Animations */
.animate-float-1 {
  animation: float-1 4s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 5s ease-in-out infinite;
}

.animate-float-3 {
  animation: float-3 6s ease-in-out infinite;
}

@keyframes float-1 {

  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0.6;
  }

  50% {
    transform: translateY(-20px) translateX(10px);
    opacity: 1;
  }
}

@keyframes float-2 {

  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0.5;
  }

  50% {
    transform: translateY(-15px) translateX(-8px);
    opacity: 0.9;
  }
}

@keyframes float-3 {

  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0.7;
  }

  50% {
    transform: translateY(-25px) translateX(5px);
    opacity: 1;
  }
}

/* 3D Rotation Utilities */
.rotate-y-12 {
  transform: rotateY(12deg);
}
</style>
