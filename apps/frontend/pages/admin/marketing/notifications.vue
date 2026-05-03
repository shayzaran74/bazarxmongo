<template>
  <div class="p-10 bg-white min-h-screen">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-black mb-2 text-black uppercase">BİLDİRİM YÖNETİM MERKEZİ</h1>
      <p class="text-gray-500 mb-10 font-bold">WebSocket Durumu: <span class="text-green-600">AKTİF (Bağlantı Sağlandı)</span></p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div class="space-y-6">
          <div class="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <label class="block text-xs font-black text-blue-900 uppercase mb-2">HEDEF KULLANICI ID (Boş bırakırsan herkese gider)</label>
            <input v-model="form.userId" placeholder="Örn: cmolhmva2000223xjbtixe16j" class="w-full p-4 border-2 border-blue-300 text-lg font-bold" />
            <div class="mt-2 flex justify-between">
              <span class="text-[10px] font-bold text-blue-700 uppercase">SENİN ID: <span class="select-all">{{ authStore.user?.id || 'Yükleniyor...' }}</span></span>
              <button @click="form.userId = authStore.user?.id" class="text-[10px] font-black text-blue-900 underline uppercase">KENDİME GÖNDER</button>
            </div>
          </div>

          <div class="space-y-4">
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest">BİLDİRİM İÇERİĞİ</label>
            <input v-model="form.title" placeholder="BİLDİRİM BAŞLIĞI" class="w-full p-4 border-2 border-black text-xl font-black" />
            <textarea v-model="form.message" placeholder="BİLDİRİM MESAJI" rows="4" class="w-full p-4 border-2 border-black text-lg font-bold"></textarea>
            <input v-model="form.link" placeholder="YÖNLENDİRME LİNKİ (OPSİYONEL)" class="w-full p-4 border-2 border-black text-lg font-bold" />
          </div>
          
          <button 
            @click="sendNotification"
            :disabled="loading"
            class="w-full py-10 bg-red-600 text-white text-3xl font-black rounded-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {{ loading ? 'GÖNDERİLİYOR...' : 'BİLDİRİMİ YAYINLA' }}
          </button>
        </div>

        <!-- MOCKUP -->
        <div class="hidden lg:block">
          <div class="sticky top-10">
             <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">MOBİL ÖNİZLEME</label>
             <div class="w-72 h-[500px] bg-black rounded-[40px] border-8 border-gray-800 p-4 shadow-2xl relative">
                <div class="w-20 h-4 bg-gray-800 absolute top-2 left-1/2 -translate-x-1/2 rounded-full"></div>
                
                <div class="mt-10 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                  <h4 class="text-white text-[10px] font-black uppercase mb-1">BAZARX</h4>
                  <h3 class="text-white text-xs font-bold">{{ form.title || 'Bildirim Başlığı' }}</h3>
                  <p class="text-white/70 text-[10px] leading-relaxed">{{ form.message || 'Mesaj içeriği burada görünecek...' }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const authStore = useAuthStore()
const form = ref({
  userId: '',
  type: 'SYSTEM',
  title: 'Merhaba BazarX!',
  message: 'Bu bildirim anlık olarak gönderilmiştir.',
  link: ''
})
const loading = ref(false)

const sendNotification = async () => {
  if (!form.value.title || !form.value.message) {
    alert('Lütfen başlık ve mesaj yazın!')
    return
  }
  loading.value = true
  try {
    const res = await $fetch('/api/v1/admin/communication/notifications/bulk', {
      method: 'POST',
      body: form.value,
      headers: {
        Authorization: `Bearer ${useCookie('access_token').value}`
      }
    })
    alert('BAŞARILI! Bildirim hem mobile hem web\'e gönderildi.')
  } catch (err) {
    alert('HATA: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>
