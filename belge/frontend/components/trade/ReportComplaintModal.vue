<template>
  <TransitionRoot
    appear
    :show="isOpen"
    as="template"
  >
    <Dialog
      as="div"
      class="relative z-[100]"
      @close="closeModal"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-lg transform overflow-hidden rounded-[3rem] bg-white p-10 text-left align-middle shadow-2xl transition-all border border-gray-100 relative"
            >
              <!-- Background Decor -->
              <div
                class="absolute -right-20 -top-20 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50"
              />

              <DialogTitle
                as="h3"
                class="text-3xl font-black text-gray-900 leading-tight uppercase italic tracking-tightest"
              >
                ŞİKAYET <span class="text-rose-600">BİLDİR</span>
              </DialogTitle>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] font-mono mt-2">
                Report Ethics & Trade Violation
              </p>

              <form
                class="mt-8 space-y-6 relative z-10"
                @submit.prevent="handleSubmit"
              >
                <!-- Reason -->
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4"
                  >Şikayet
                    Nedeni</label>
                  <select
                    v-model="form.reason"
                    required
                    class="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-rose-500 focus:ring-0 transition-all outline-none appearance-none"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Nedensiz şikayet bildirilemez
                    </option>
                    <option
                      v-for="r in reasons"
                      :key="r"
                      :value="r"
                    >
                      {{ r }}
                    </option>
                  </select>
                </div>

                <!-- Description -->
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4"
                  >Detaylı
                    Açıklama</label>
                  <textarea
                    v-model="form.description"
                    rows="4"
                    placeholder="Lütfen olayı detaylarıyla açıklayın. Ekip arkadaşlarımız inceleyecektir."
                    class="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-6 py-4 text-sm font-bold focus:border-rose-500 focus:ring-0 transition-all outline-none resize-none"
                  />
                </div>

                <!-- Note -->
                <div class="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <p class="text-[10px] font-bold text-rose-700 leading-relaxed italic">
                    * Yanıltıcı veya kötü niyetli şikayet bildirimleri, bildiren kullanıcının itibar
                    puanının düşmesine veya hesabının askıya alınmasına neden olabilir.
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    class="flex-1 px-8 py-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                    @click="closeModal"
                  >
                    İPTAL
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="flex-[2] px-8 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
                  >
                    <span v-if="loading">GÖNDERİLİYOR...</span>
                    <span v-else>ŞİKAYETİ BİLDİR</span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle,
} from '@headlessui/vue'

const props = defineProps({
    isOpen: Boolean,
    targetId: {
        type: String,
        required: true
    },
    tradeId: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const config = useRuntimeConfig()

const reasons = [
    'Sahte veya Eksik Ürün Gönderimi',
    'İletişim Kurulamıyor',
    'Yanıltıcı İlan Bilgileri',
    'Kötü Niyetli Davranış',
    'Takas Şartlarına Uyulmaması',
    'Diğer'
]

const form = ref({
    reason: '',
    description: ''
})

const closeModal = () => {
    form.value.reason = ''
    form.value.description = ''
    emit('close')
}

const handleSubmit = async () => {
    loading.value = true
    try {
        const response = await $fetch('/api/complaints', {
            method: 'POST',
            baseURL: config.public.apiBase,
            body: {
                targetId: props.targetId,
                tradeId: props.tradeId,
                reason: form.value.reason,
                description: form.value.description
            }
        })

        if (response.success) {
            useToast().success('Şikayetiniz başarıyla iletildi.')
            emit('success')
            closeModal()
        }
    } catch (error) {
        useToast().error(error.data?.error || 'Şikayet iletilemedi.')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.tracking-tightest {
    letter-spacing: -0.05em;
}
</style>
