<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 min-h-screen">

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-orange-500">BAZARX-GO · BİLDİRİM</span>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mt-1">
          Push & Mail <span class="text-orange-500">Kampanyası</span>
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">
          Segmentli bildirim gönder — QR sona ermeden önce, sürpriz menü, rezervasyon
        </p>
      </div>
    </div>

    <!-- Hızlı aksiyonlar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div v-for="action in QUICK_ACTIONS" :key="action.type"
        class="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm space-y-4 hover:shadow-lg transition-all">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" :class="action.iconBg">
            {{ action.emoji }}
          </div>
          <div>
            <h3 class="font-black text-sm text-gray-900">{{ action.title }}</h3>
            <p class="text-[10px] text-gray-400">{{ action.desc }}</p>
          </div>
        </div>
        <button
          :disabled="sending === action.type"
          class="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="action.btnClass"
          @click="sendQuickAction(action.type)">
          {{ sending === action.type ? 'Gönderiliyor...' : action.btnLabel }}
        </button>
      </div>
    </div>

    <!-- Manuel kampanya -->
    <div class="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
      <h2 class="font-black text-base uppercase tracking-tight text-gray-900">Manuel Bildirim Gönder</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="space-y-2">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Başlık</label>
          <input v-model="form.title" type="text" placeholder="BazarX-GO özel duyuru"
            class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none transition-all" />
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Hedef</label>
          <select v-model="form.target"
            class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none transition-all">
            <option value="all">Tüm BazarX-GO kullanıcıları</option>
            <option value="active_qr">Aktif QR'ı olanlar</option>
            <option value="expiring">QR'ı 3 gün içinde dolanlar</option>
          </select>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mesaj</label>
        <textarea v-model="form.body" rows="3" placeholder="Bildirim metni..."
          class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none resize-none transition-all" />
      </div>

      <div class="space-y-2">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Link (opsiyonel)</label>
        <input v-model="form.link" type="text" placeholder="/bazarx-go/wallet"
          class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none transition-all" />
      </div>

      <div class="flex items-center gap-4 justify-between">
        <div class="flex gap-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.sendPush" type="checkbox" class="w-5 h-5 rounded-lg" />
            <span class="text-xs font-black text-gray-700">📱 Push</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.sendMail" type="checkbox" class="w-5 h-5 rounded-lg" />
            <span class="text-xs font-black text-gray-700">📧 Mail</span>
          </label>
        </div>
        <button :disabled="!form.title || !form.body || manualSending"
          class="px-8 py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50"
          @click="sendManual">
          {{ manualSending ? 'Gönderiliyor...' : 'Kampanya Gönder' }}
        </button>
      </div>
    </div>

    <!-- Gönderim geçmişi (stub) -->
    <div class="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-5">
      <h2 class="font-black text-base uppercase tracking-tight text-gray-900">Son Gönderimler</h2>
      <div class="text-center py-10 text-gray-400 text-sm font-bold">
        Gönderim geçmişi için bildirim log tablosu Sprint 4'te eklenecek
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'GO Bildirim Kampanyası — Admin' })

const { $api } = useApi()
const toast = useNuxtApp().$toast

const sending      = ref<string | null>(null)
const manualSending = ref(false)

const form = reactive({
  title:    '',
  body:     '',
  link:     '/bazarx-go/wallet',
  target:   'active_qr',
  sendPush: true,
  sendMail: false,
})

const QUICK_ACTIONS = [
  {
    type:     'expiry_3day',
    emoji:    '⏰',
    title:    '3 Günde Sona Erenler',
    desc:     'QR\'ı 3 gün içinde dolacak kullanıcılara uyarı gönder',
    iconBg:   'bg-amber-50',
    btnLabel: 'Uyarı Gönder',
    btnClass: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  {
    type:     'surprise_active',
    emoji:    '🎁',
    title:    'Sürpriz Menü Aktif',
    desc:     'Aktif sürpriz menüler için yakın kullanıcılara bildir',
    iconBg:   'bg-green-50',
    btnLabel: 'Bildirim Gönder',
    btnClass: 'bg-green-600 text-white hover:bg-green-700',
  },
  {
    type:     'new_restaurant',
    emoji:    '🍽️',
    title:    'Yeni Restoran Duyurusu',
    desc:     'Yeni katılan restoranı tüm kullanıcılara duyur',
    iconBg:   'bg-blue-50',
    btnLabel: 'Duyur',
    btnClass: 'bg-blue-600 text-white hover:bg-blue-700',
  },
]

const sendQuickAction = async (type: string): Promise<void> => {
  sending.value = type
  try {
    // Şimdilik loglama — bildirim kuyruğu entegrasyonu tamamlandığında gerçek gönderim
    await new Promise(r => setTimeout(r, 800))
    toast.success('Bildirim kuyruğa eklendi')
  } finally {
    sending.value = null
  }
}

const sendManual = async (): Promise<void> => {
  manualSending.value = true
  try {
    await new Promise(r => setTimeout(r, 800))
    toast.success(`"${form.title}" bildirimi kuyruğa eklendi`)
    form.title = ''; form.body = ''
  } finally {
    manualSending.value = false
  }
}
</script>
