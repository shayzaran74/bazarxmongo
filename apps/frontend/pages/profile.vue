<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Profile Header -->
    <div class="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
      <div class="absolute top-0 right-0 p-8">
        <div class="px-4 py-2 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          {{ userRole }} Hesabı
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div class="w-32 h-32 bg-dark-950 rounded-[2rem] flex items-center justify-center text-4xl font-display font-black text-white shadow-2xl border-4 border-white overflow-hidden">
          <img v-if="avatarUrl" :src="avatarUrl" class="w-full h-full object-cover" />
          <span v-else>{{ user?.name?.charAt(0).toUpperCase() || 'U' }}</span>
        </div>
        
        <div class="text-center md:text-left space-y-2">
          <h1 class="text-4xl font-display font-black text-dark-950 italic tracking-tighter">{{ fullName || 'Kullanıcı' }}</h1>
          <p class="text-gray-400 font-medium">{{ user?.email }}</p>
          <div class="flex items-center justify-center md:justify-start gap-4 pt-4">
            <button class="px-6 py-3 bg-dark-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95">
              Profili Düzenle
            </button>
            <button @click="logout" class="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
          <Icon :name="stat.icon" class="w-6 h-6" />
        </div>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
        <p class="text-2xl font-display font-black text-dark-950 italic">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Content Placeholder -->
    <div class="bg-gray-50 rounded-[3rem] p-12 lg:p-20 text-center border-2 border-dashed border-gray-200">
      <div class="max-w-sm mx-auto space-y-6">
        <Icon name="heroicons:rectangle-stack" class="w-16 h-16 text-gray-300 mx-auto" />
        <h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter">Henüz Bir Aktivite Yok</h2>
        <p class="text-gray-400 text-sm font-medium">Yaptığınız işlemler, teklifler ve favorileriniz burada görünecek.</p>
        <NuxtLink to="/products" class="inline-block px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl">
          Alışverişe Başla
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, fullName, avatarUrl, userRole, logout } = useAuth();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
};

const stats = [
  { label: 'Cüzdan Bakiyesi', value: formatPrice(user.value?.Wallet?.balance || 0), icon: 'heroicons:wallet' },
  { label: 'Aktif Teklifler', value: '0', icon: 'heroicons:arrows-right-left' },
  { label: 'Tamamlanan Takaslar', value: '0', icon: 'heroicons:check-badge' }
];

definePageMeta({
  middleware: ['auth']
});
</script>
