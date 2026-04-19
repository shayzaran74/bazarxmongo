<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight uppercase italic">
          Bülten ve Kampanya Yönetimi
        </h1>
        <p class="text-gray-500 mt-1">
          Abone olan kullanıcılara toplu e-posta gönderin.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Send Campaign Form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PaperAirplaneIcon class="h-6 w-6 text-primary-600" />
            Yeni Kampanya E-postası
          </h2>

          <div class="space-y-6">
            <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gönderim
                Hedefi</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="target in targets"
                  :key="target.id"
                  class="p-4 rounded-2xl border-2 transition-all text-center"
                  :class="form.target === target.id ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-50 bg-gray-50 text-gray-500 hover:border-gray-200'"
                  @click="form.target = target.id"
                >
                  <div class="font-bold text-sm">
                    {{ target.name }}
                  </div>
                  <div class="text-[10px] opacity-70">
                    {{ target.desc }}
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">E-posta
                Konusu</label>
              <input
                v-model="form.subject"
                type="text"
                placeholder="Örn: %50 İndirim Fırsatını Kaçırmayın! 🔥"
                class="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
              >
            </div>

            <div>
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">İçerik (HTML
                desteklenir)</label>
              <textarea
                v-model="form.content"
                rows="12"
                placeholder="Kampanya detaylarını buraya yazın..."
                class="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
              />
              <p class="text-[10px] text-gray-400 mt-2 px-1 italic">
                Not: İçerik otomatik olarak şık bir şablonun içine
                yerleştirilecektir.
              </p>
            </div>

            <div class="pt-4">
              <button
                :disabled="sending || !form.subject || !form.content"
                class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary-100 flex items-center justify-center gap-2"
                @click="sendBulkEmail"
              >
                <span v-if="sending">GÖNDERİLİYOR...</span>
                <template v-else>
                  GÖNDERİMİ BAŞLAT
                  <PaperAirplaneIcon class="h-4 w-4" />
                </template>
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8 overflow-hidden">
          <h2 class="text-xl font-bold text-gray-900 mb-6">
            Önizleme
          </h2>
          <div class="border-4 border-gray-50 rounded-2xl p-4 bg-gray-50/30">
            <div
              class="max-w-[400px] mx-auto bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm pointer-events-none select-none opacity-80 scale-90 origin-top"
            >
              <div class="p-4 text-center border-b border-gray-50">
                <h1 class="text-primary-600 font-black italic">
                  🏭 TicariTakas
                </h1>
              </div>
              <!-- eslint-disable vue/no-v-html -->
              <div
                class="p-6 text-sm text-gray-700 min-h-[100px]"
                v-html="form.content || 'E-posta içeriği burada görünecek...'"
              />
              <!-- eslint-enable vue/no-v-html -->
              <div class="p-4 bg-gray-50 text-[8px] text-center text-gray-400">
                &copy; 2025 TicariTakas. Tüm hakları saklıdır.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscribers List -->
      <div class="space-y-6">
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UsersIcon class="h-6 w-6 text-indigo-500" />
            Son Aboneler
          </h2>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center">
              <div class="text-2xl font-black text-indigo-600 leading-tight">
                {{ stats.subscribers }}
              </div>
              <div class="text-[10px] uppercase font-black text-indigo-400 tracking-tighter">
                Bülten Abone
              </div>
            </div>
            <div class="bg-primary-50 p-4 rounded-2xl border border-primary-100 text-center">
              <div class="text-2xl font-black text-primary-600 leading-tight">
                {{ stats.users }}
              </div>
              <div class="text-[10px] uppercase font-black text-primary-400 tracking-tighter">
                Kayıtlı Üye
              </div>
            </div>
          </div>

          <div
            v-if="loading"
            class="space-y-4"
          >
            <div
              v-for="i in 5"
              :key="i"
              class="h-12 bg-gray-50 rounded-xl animate-pulse"
            />
          </div>
          <div
            v-else-if="subscribers.length === 0"
            class="text-center py-12 text-gray-400 italic"
          >
            Henüz abone yok
          </div>
          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="sub in subscribers.slice(0, 10)"
              :key="sub.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-50 hover:border-gray-200 transition-all"
            >
              <div class="truncate pr-2">
                <div class="text-xs font-bold text-gray-800 truncate">
                  {{ sub.email }}
                </div>
                <div class="text-[9px] text-gray-400">
                  {{ formatDate(sub.createdAt) }}
                </div>
              </div>
              <div
                class="w-2 h-2 rounded-full"
                :class="sub.isActive ? 'bg-green-400' : 'bg-red-400'"
                :title="sub.isActive ? 'Aktif' : 'Pasif'"
              />
            </div>

            <div class="pt-4 text-center">
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Toplam {{ subscribers.length }} Abone
              </div>
            </div>
          </div>
        </div>

        <div class="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
          <div class="flex items-center gap-2 mb-4">
            <SparklesIcon class="h-6 w-6 text-indigo-300" />
            <h3 class="font-bold">
              E-posta İpuçları
            </h3>
          </div>
          <ul class="text-xs space-y-3 opacity-80 list-disc pl-4">
            <li>Konu satırında emoji kullanmak açılma oranını artırır.</li>
            <li>HTML butonlar ekleyerek tıklanma oranını artırabilirsiniz.</li>
            <li>Kampanya sonuna "Abonelikten Ayrıl" linki otomatik eklenir.</li>
            <li>Akşam saatlerinde gönderilen e-postalar daha çok okunur.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  PaperAirplaneIcon,
  UsersIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const authStore = useAuthStore()
const { $api } = useApi()
const toast = useNuxtApp().$toast

const loading = ref(true)
const sending = ref(false)
const subscribers = ref([])
const stats = ref({ subscribers: 0, users: 0 })

const targets = [
  { id: 'all', name: 'Herkes', desc: 'Üyeler + Aboneler' },
  { id: 'subscribers', name: 'Aboneler', desc: 'Sadece bülten aboneleri' },
  { id: 'users', name: 'Üyeler', desc: 'Sadece kayıtlı kullanıcılar' }
]

const form = ref({
  target: 'all',
  subject: '',
  content: ''
})

const fetchSubscribers = async () => {
  loading.value = true
  try {
    const [subRes, statRes] = await Promise.all([
      $api('/api/admin/newsletter/subscribers'),
      $api('/api/admin/newsletter/stats')
    ])

    if (subRes.success) subscribers.value = subRes.data
    if (statRes.success) stats.value = statRes.data
  } catch (error) {
    console.error('Error fetching subscribers:', error)
  } finally {
    loading.value = false
  }
}

const sendBulkEmail = async () => {
  if (!confirm('E-posta gönderimini başlatmak istediğinize emin misiniz?')) return

  sending.value = true
  try {
    const response = await $api('/api/admin/newsletter/send-bulk', {
      method: 'POST',
      body: form.value
    })

    if (response.success) {
      toast.success(response.message)
      // form.value.subject = ''
      // form.value.content = ''
    } else {
      toast.error(response.message || 'Gönderim başarısız oldu.')
    }
  } catch (error) {
    console.error('Error sending bulk email:', error)
    toast.error('Bir hata oluştu.')
  } finally {
    sending.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  if (!authStore.isAdmin) navigateTo('/')
  fetchSubscribers()
})
</script>
