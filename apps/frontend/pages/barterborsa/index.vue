<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Home Banner Slider -->
    <HomeBanner ecosystem="BARTER_BORSA" />

    <div class="py-12 px-4">
      <div class="text-center max-w-2xl mx-auto">
        <!-- Animated Icon -->
        <div class="relative w-40 h-40 mx-auto mb-10">
          <!-- Outer Ring -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full animate-pulse opacity-40"
          />
          <!-- Middle Ring -->
          <div class="absolute inset-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full" />
          <!-- Inner Circle -->
          <div class="absolute inset-8 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <span class="text-5xl animate-bounce">💼</span>
          </div>
          <!-- Sparkle Effects -->
          <div class="absolute top-2 right-4 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
          <div class="absolute bottom-6 left-2 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-300" />
          <div class="absolute top-1/2 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-700" />
        </div>

        <!-- Title -->
        <h1
          class="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-500 mb-4"
        >
          Barter Borsa
        </h1>

        <!-- Subtitle -->
        <p class="text-xl md:text-2xl font-bold text-gray-700 mb-3">
          Çok Yakında Sizlerle! 🚀
        </p>

        <!-- Description -->
        <p class="text-gray-500 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
          Barter Borsa ekosistemi şu anda geliştirme aşamasındadır.
          <strong class="text-amber-700">Elite</strong> ve <strong class="text-amber-700">Apex</strong>
          üyelerine
          özel
          bu platform sayesinde, ürünlerinizi ve hizmetlerinizi nakit kullanmadan takas edebileceksiniz.
        </p>

        <!-- Features Preview -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-xl mx-auto">
          <div
            class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 shadow-lg shadow-amber-100/50"
          >
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">🔄</span>
            </div>
            <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider">
              Akıllı Eşleşme
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              AI destekli takas eşleştirme sistemi
            </p>
          </div>
          <div
            class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 shadow-lg shadow-amber-100/50"
          >
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">🏦</span>
            </div>
            <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider">
              Güvenli Takas
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              Escrow korumalı işlem altyapısı
            </p>
          </div>
          <div
            class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-amber-100 shadow-lg shadow-amber-100/50"
          >
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl">📊</span>
            </div>
            <h3 class="text-sm font-black text-gray-800 uppercase tracking-wider">
              Borsa Panosu
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              Canlı takas oranları ve analitik
            </p>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink
            to="/"
            class="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all"
          >
            🛒 BazarX'e Dön
          </NuxtLink>
          <NuxtLink
            to="/premium"
            class="px-8 py-4 bg-white text-amber-700 border-2 border-amber-200 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:border-amber-400 hover:-translate-y-1 transition-all"
          >
            ⭐ Premium Üyelik
          </NuxtLink>
        </div>

        <!-- Quick Navigation to New Pages -->
        <div class="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          <NuxtLink
            to="/barterborsa/analitik"
            class="flex items-center gap-2 px-4 py-3 bg-white border border-amber-100 rounded-xl text-sm font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
          >
            <span class="text-base">📊</span>
            Executive Analitik
          </NuxtLink>
          <NuxtLink
            to="/barterborsa/kurumsal"
            class="flex items-center gap-2 px-4 py-3 bg-white border border-amber-100 rounded-xl text-sm font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
          >
            <span class="text-base">🏢</span>
            Kurumsal Araçlar
          </NuxtLink>
          <NuxtLink
            to="/barterborsa/ticari-detay"
            class="flex items-center gap-2 px-4 py-3 bg-white border border-amber-100 rounded-xl text-sm font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
          >
            <span class="text-base">🔄</span>
            Ticari Takas Detay
          </NuxtLink>
          <NuxtLink
            to="/barterborsa/b2b-dashboard"
            class="flex items-center gap-2 px-4 py-3 bg-white border border-amber-100 rounded-xl text-sm font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
          >
            <span class="text-base">💼</span>
            B2B Dashboard
          </NuxtLink>
          <NuxtLink
            to="/barterborsa/islem-gecmisi"
            class="flex items-center gap-2 px-4 py-3 bg-white border border-amber-100 rounded-xl text-sm font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
          >
            <span class="text-base">🧾</span>
            İşlem Geçmişi
          </NuxtLink>
          <NuxtLink
            to="/barterborsa/yonetim-paneli"
            class="flex items-center gap-2 px-4 py-3 bg-white border border-amber-100 rounded-xl text-sm font-semibold text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
          >
            <span class="text-base">👥</span>
            Bayi Yönetim Paneli
          </NuxtLink>
        </div>

        <!-- Coming Soon Timer Style -->
        <div
          class="mt-12 inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-amber-100 shadow-sm"
        >
          <span class="relative flex h-3 w-3">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
            />
            <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
          <p class="text-sm font-bold text-amber-700 tracking-wider uppercase">
            Geliştirme Aşamasında
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'default'
})

useHead({
    title: 'Barter Borsa - Çok Yakında',
    meta: [
        { name: 'description', content: 'Barter Borsa ekosistemi çok yakında sizlerle. Elite ve Apex üyelere özel takas platformu.' }
    ]
})
</script>
