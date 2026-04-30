<template>
  <div class="min-h-screen bg-[#F1F5F9] p-8">
    <div class="max-w-5xl mx-auto">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <NuxtLink
            to="/partner/dashboard"
            class="text-slate-500 hover:text-purple-600 font-bold flex items-center gap-2 mb-2 transition-colors"
          >
            ← Panele Dön
          </NuxtLink>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">
            Toplu Ürün Yükleme (B2B)
          </h1>
          <p class="text-slate-500">
            Excel veya JSON dosyası ile binlerce ürünü saniyeler içinde mağazanıza
            ekleyebilirsiniz.
          </p>
        </div>
        <div class="flex gap-3">
          <button
            class="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-all text-sm"
            @click="downloadTemplate"
          >
            📄 Excel Şablonu
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Upload Section -->
        <div class="lg:col-span-2 space-y-6">
          <div
            :class="[
              'relative border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer bg-white h-80 flex flex-col items-center justify-center',
              dragOver ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'
            ]"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept=".xlsx, .xls, .json"
              @change="handleFileSelect"
            >

            <div
              class="w-20 h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm"
            >
              {{ isParsing ? '⌛' : '📤' }}
            </div>

            <h3 class="text-xl font-bold text-slate-800 mb-2">
              {{ selectedFile ? selectedFile.name : 'Dosyayı Sürükleyin veya Seçin' }}
            </h3>
            <p class="text-slate-400 max-w-sm">
              XLSX, XLS veya JSON formatları desteklenir. binlerce satırı tek seferde işleyebiliriz.
            </p>

            <div
              v-if="selectedFile"
              class="mt-8 flex gap-4"
            >
              <button
                :disabled="isParsing"
                class="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-xl disabled:bg-slate-300"
                @click.stop="startUpload"
              >
                {{ isParsing ? 'İşleniyor...' : 'Yüklemeyi Başlat' }}
              </button>
              <button
                class="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                @click.stop="selectedFile = null"
              >
                İptal
              </button>
            </div>
          </div>

          <!-- Progress / Queue (Mock for Visual Polish) -->
          <div
            v-if="uploadStatus"
            class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-bold text-slate-800">
                İşlem Durumu
              </h4>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                  uploadStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                ]"
              >
                {{ uploadStatus === 'completed' ? 'Tamamlandı' : 'Devam Ediyor' }}
              </span>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-500">Ürünler İşleniyor...</span>
                <span class="font-bold text-purple-600">{{ progress }}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-3">
                <div
                  class="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  :style="{ width: progress + '%' }"
                />
              </div>

              <div
                v-if="report"
                class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100"
              >
                <div class="text-center">
                  <p class="text-2xl font-black text-green-600">
                    {{ report.success }}
                  </p>
                  <p class="text-[10px] uppercase font-bold text-slate-400">
                    Yeni Eklenen
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-black text-blue-600">
                    {{ report.updated }}
                  </p>
                  <p class="text-[10px] uppercase font-bold text-slate-400">
                    Güncellenen
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-black text-slate-400">
                    {{ report.skipped }}
                  </p>
                  <p class="text-[10px] uppercase font-bold text-slate-400">
                    Atlanan
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-black text-red-600">
                    {{ report.failed }}
                  </p>
                  <p class="text-[10px] uppercase font-bold text-slate-400">
                    Hatalı
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions Sidebar -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span class="text-xl">⚠️</span> Dikkat Edilmesi Gerekenler
            </h4>
            <ul class="space-y-4 text-sm text-slate-600">
              <li class="flex gap-3">
                <span class="text-purple-500 font-bold">•</span>
                <span><strong>SKU:</strong> Her ürünün benzersiz bir Stok Kodu (SKU) olmalıdır. Mevcut
                  SKU'lar güncellenecektir.</span>
              </li>
              <li class="flex gap-3">
                <span class="text-purple-500 font-bold">•</span>
                <span><strong>Görseller:</strong> URL olarak sağlanmalıdır. Birden fazla görseli
                  virgülle ayırabilirsiniz.</span>
              </li>
              <li class="flex gap-3">
                <span class="text-purple-500 font-bold">•</span>
                <span><strong>Limit:</strong> Tek seferde maksimum 5.000 ürün yükleyebilirsiniz. Daha
                  fazlası için API kullanın.</span>
              </li>
            </ul>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden relative">
            <div class="absolute -right-4 -bottom-4 text-7xl opacity-5 rotate-12">
              📄
            </div>
            <h4 class="font-bold text-slate-800 mb-2">
              Örnek Ürün Formatı
            </h4>
            <pre class="bg-slate-900 text-purple-300 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre">
{
  "name": "Siyah Polo Yaka Tişört",
  "sku": "POLO-001",
  "price": 450.00,
  "stock": 100,
  "brand": "CottonX",
  "gtin": "8680011223344"
}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const { $api } = useApi()

definePageMeta({
    middleware: ['auth', 'vendor']
})

const dragOver = ref(false)
const selectedFile = ref(null)
const isParsing = ref(false)
const uploadStatus = ref(null) // 'processing', 'completed'
const progress = ref(0)
const report = ref(null)

const handleDrop = (e) => {
    dragOver.value = false
    const file = e.dataTransfer.files[0]
    if (file) selectedFile.value = file
}

const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) selectedFile.value = file
}

const startUpload = async () => {
    if (!selectedFile.value) return

    isParsing.value = true
    uploadStatus.value = 'processing'
    progress.value = 10

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    try {
        const res = await $api('/api/vendors/products/bulk/import', {
            method: 'POST',
            body: formData
        })

        if (res.success) {
            progress.value = 100
            uploadStatus.value = 'completed'
            report.value = res.data
        }
    } catch (err) {
        useNuxtApp().$toast.error('Yükleme hatası: ' + (err.data?.error || err.message))
        uploadStatus.value = null
    } finally {
        isParsing.value = false
    }
}

const downloadTemplate = () => {
    window.open('/api/vendors/products/bulk/template/bayi', '_blank')
}
</script>
