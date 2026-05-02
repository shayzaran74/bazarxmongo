<template>
  <section class="py-32 bg-[#000814]" id="ecosystem">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
      <div class="text-center mb-24 space-y-4">
        <span class="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">AVANTAJLAR</span>
        <h2 class="text-5xl md:text-6xl font-black text-white tracking-tightest leading-none italic uppercase">
          NEDEN <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">TİCARİ TAKAS?</span>
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Büyük Kart: Stok Optimizasyonu -->
        <div class="md:col-span-2 bg-[#001220] p-12 rounded-[3.5rem] border border-white/5 flex flex-col justify-between group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div class="relative z-10">
            <div class="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 mb-10 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
              <svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h3 class="text-3xl font-black text-white mb-6 italic uppercase tracking-tighter">Atıl Stok Optimizasyonu</h3>
            <p class="text-slate-400 leading-relaxed mb-12 max-w-xl text-lg font-medium">
              Hareket görmeyen envanterinizi anında takas kredisine dönüştürün. Depolama maliyetleri ve değer kaybıyla uğraşmak yerine, stoğunuzu gerekli iş hizmetleri için likit bir varlık olarak kullanın.
            </p>
          </div>
          
          <div class="relative overflow-hidden rounded-[2.5rem] h-80 z-10 group-hover:shadow-2xl transition-all duration-700 border border-white/5">
            <img
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2670&auto=format&fit=crop"
              alt="Inventory"
              class="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-[#000814]/80 to-transparent" />
          </div>
        </div>

        <!-- Küçük Kart: Nakit Akışı -->
        <div class="bg-gradient-to-b from-[#001220] to-[#000814] p-12 rounded-[3.5rem] border border-white/5 flex flex-col group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />
          
          <div class="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 mb-10 group-hover:scale-110 group-hover:bg-indigo-600/20 transition-all">
            <svg class="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          
          <h3 class="text-3xl font-black text-white mb-6 italic uppercase tracking-tighter relative z-10">Nakit Akışı</h3>
          <p class="text-slate-400 leading-relaxed mb-12 relative z-10 font-medium text-lg">
            Nakit paranızı temel sermaye harcamalarınız için saklayın. Pazarlama ve lojistik gibi maliyetleriniz için takas bakiyenizi kullanın.
          </p>

          <div class="mt-auto pt-10 border-t border-white/5 relative z-10">
            <div class="text-5xl font-black mb-2 text-white italic tracking-tighter group-hover:text-indigo-400 transition-colors">0% FAİZ</div>
            <div class="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">TAKAS KREDİLERİNDE</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.05em; }
</style>
