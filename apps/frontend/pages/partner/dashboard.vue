<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <!-- Top Stats / Header -->
    <div class="bg-gradient-to-r from-[#1E293B] to-[#334155] text-white p-8 shadow-lg">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span
                class="bg-purple-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
              >B2B
                Corporate Partner</span>
              <span
                v-if="vendor?.b2bTier"
                class="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
              >
                {{ vendor.b2bTier }}
              </span>
            </div>
            <h1 class="text-4xl font-extrabold tracking-tight">
              {{ vendor?.businessName || 'Corporate Partner' }}
            </h1>
            <p class="text-slate-300 mt-2 max-w-xl">
              Kurumsal iş ortağı panelinize hoş geldiniz. Binlerce ürününüzü tek seferde yönetin, özel
              barter limitlerinizi takip edin.
            </p>
          </div>

          <div class="flex gap-4">
            <NuxtLink
              to="/partner/bulk-upload"
              class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <span class="text-xl">📥</span> Toplu İlan Yükle
            </NuxtLink>
            <button
              class="bg-[#F1F5F9] hover:bg-white text-[#1E293B] px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span class="text-xl">⚙️</span> Ayarlar
            </button>
          </div>
        </div>

        <!-- Tier & Limits Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p class="text-slate-400 text-sm font-semibold mb-1">
              Özel Barter Limiti
            </p>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black">₺{{ formatCurrency(vendor?.barterLimitOverride || 0)
              }}</span>
            </div>
            <div class="mt-4 w-full bg-white/10 rounded-full h-2">
              <div
                class="bg-purple-400 h-2 rounded-full"
                :style="{ width: '35%' }"
              />
            </div>
            <p class="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-tighter">
              Harcandı: ₺0 /
              Mevcut: ₺{{ formatCurrency(vendor?.barterLimitOverride || 0) }}
            </p>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p class="text-slate-400 text-sm font-semibold mb-1">
              Kurumsal Komisyon Oranı
            </p>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black">%{{ vendor?.commissionRateB2B || 10 }}</span>
              <span class="text-xs text-green-400 font-bold">Standard: %15</span>
            </div>
            <p class="text-slate-400 text-[10px] mt-2 italic">
              Size özel tanımlanmış Prime avantajıdır.
            </p>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p class="text-slate-400 text-sm font-semibold mb-1">
              Stok Kapasitesi
            </p>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black">Sınırsız</span>
            </div>
            <p class="text-slate-400 text-[10px] mt-2 uppercase font-bold tracking-tighter">
              {{
                vendor?.totalProducts || 0 }} Aktif Ürün
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto p-8 -mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1 space-y-4">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Navigasyon
              </h3>
              <nav class="space-y-1">
                <a
                  href="#"
                  class="flex items-center gap-3 px-4 py-3 bg-slate-50 text-purple-700 rounded-xl font-bold"
                >
                  <span class="text-lg">📊</span> Genel Bakış
                </a>
                <a
                  href="#"
                  class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                >
                  <span class="text-lg">📦</span> Stok Yönetimi
                </a>
                <a
                  href="#"
                  class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                >
                  <span class="text-lg">🤝</span> Takas Talepleri
                </a>
                <a
                  href="#"
                  class="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                >
                  <span class="text-lg">📜</span> İşlem Geçmişi
                </a>
              </nav>
            </div>
          </div>

          <div class="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
            <h4 class="font-bold text-lg mb-2">
              Prime Support
            </h4>
            <p class="text-sm text-purple-100 mb-4">
              Kurumsal ortağımız olarak VIP destek hattımız her zaman
              yanınızda.
            </p>
            <button
              class="w-full bg-white text-purple-700 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-purple-50 transition-colors"
            >
              Müşteri Temsilcisi ile Görüş
            </button>
          </div>
        </div>

        <!-- Inventory Overview -->
        <div class="lg:col-span-3 space-y-8">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-slate-800">
                Envanter Sağlığı
              </h2>
              <select
                class="bg-slate-100 border-none rounded-lg text-sm font-semibold px-4 py-2 outline-none cursor-pointer"
              >
                <option>Son 30 Gün</option>
                <option>Son 90 Gün</option>
              </select>
            </div>

            <div
              class="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200"
            >
              <div class="text-center">
                <p class="text-slate-400 font-medium">
                  Satış Grafikleri Yükleniyor...
                </p>
                <div class="flex gap-1 justify-center mt-2">
                  <div
                    class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style="animation-delay: 0s"
                  />
                  <div
                    class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style="animation-delay: 0.1s"
                  />
                  <div
                    class="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style="animation-delay: 0.2s"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                📝
              </div>
              <div>
                <h4 class="font-bold text-slate-800">
                  CSV/Excel Şablonu İndir
                </h4>
                <p class="text-sm text-slate-500">
                  Hazır ürün şablonunu kullanarak ilanlarınızı
                  hazırlayın.
                </p>
              </div>
            </div>
            <div
              class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                🔗
              </div>
              <div>
                <h4 class="font-bold text-slate-800">
                  JSON/API Entegrasyonu
                </h4>
                <p class="text-sm text-slate-500">
                  Kendi ERP sisteminizi doğrudan mağazamıza bağlayın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const { $api } = useApi()

definePageMeta({
    middleware: ['auth', 'vendor']
})

const vendor = ref(null)
const loading = ref(true)

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 0 }).format(val)
}

const fetchVendorData = async () => {
    try {
        const res = await $api('/api/vendors/my-vendor')
        if (res.success) {
            vendor.value = res.data
        }
    } catch (err) {
        console.error('Vendor fetch error:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchVendorData()
})
</script>

<style scoped>
/* Glassmorphism effects or custom animations can go here */
</style>
