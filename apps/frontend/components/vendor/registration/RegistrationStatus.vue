<template>
  <div class="p-12 text-center flex-1 flex flex-col items-center justify-center">
    <div v-if="status === 'APPROVED'" class="animate-in fade-in zoom-in duration-700">
      <div class="w-24 h-24 bg-green-50 text-green-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-xl shadow-green-100 transform -rotate-12">
        ✅
      </div>
      <h3 class="text-3xl font-black text-neutral-900 mb-4 italic uppercase tracking-tighter">Harika! Zaten Satıcısınız</h3>
      <p class="text-[10px] font-black text-neutral-400 mb-10 max-w-md mx-auto uppercase tracking-widest leading-loose italic">
        Satıcı panelinizden ürünlerinizi yönetmeye ve satışlarınızı takip etmeye başlayabilirsiniz.
      </p>
      <NuxtLink to="/vendor/dashboard" class="px-12 py-5 bg-gray-900 text-white rounded-[2rem] hover:bg-black font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl shadow-gray-200">
        Satıcı Paneline Git
      </NuxtLink>
    </div>

    <div v-else-if="status === 'PENDING'" class="animate-in fade-in zoom-in duration-700">
      <div class="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-xl shadow-amber-100 animate-pulse">
        ⏳
      </div>
      <h3 class="text-3xl font-black text-neutral-900 mb-4 italic uppercase tracking-tighter">Başvurunuz İnceleniyor</h3>
      <p class="text-[10px] font-black text-neutral-400 max-w-md mx-auto uppercase tracking-widest leading-loose italic">
        Uzman ekibimiz başvurunuzu inceliyor. Onaylandığında size e-posta ile bildireceğiz.
      </p>
    </div>

    <div v-else-if="!isLoggedIn" class="animate-in fade-in zoom-in duration-700">
      <div class="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 mx-auto shadow-xl shadow-indigo-100">
        🔒
      </div>
      <h3 class="text-3xl font-black text-neutral-900 mb-4 italic uppercase tracking-tighter">Devam Etmek İçin Giriş Yapın</h3>
      <p class="text-[10px] font-black text-neutral-400 mb-10 max-w-md mx-auto uppercase tracking-widest leading-loose italic">
        Satıcı başvurusu yapabilmek için BazarX hesabınıza giriş yapmalısınız.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 w-full max-w-xs mx-auto">
        <NuxtLink to="/auth/login" class="flex-1 bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-black font-black text-[10px] uppercase tracking-widest transition-all shadow-xl">GİRİŞ YAP</NuxtLink>
        <NuxtLink to="/auth/register" class="flex-1 bg-white border-2 border-neutral-100 text-neutral-700 px-8 py-4 rounded-2xl hover:bg-neutral-50 font-black text-[10px] uppercase tracking-widest transition-all">KAYIT OL</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  status: String,
  isLoggedIn: Boolean
})
</script>
