<template>
  <div class="p-8 max-w-7xl mx-auto space-y-10">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h1 class="text-4xl font-black text-gray-900 flex items-center gap-4 tracking-tighter">
          <div class="bg-primary-600 p-2 rounded-2xl shadow-xl shadow-primary-200">
            <SparklesIcon class="h-8 w-8 text-white" />
          </div>
          Dinamik Rozet (Badge) Yönetimi
        </h1>
        <p class="text-gray-500 font-medium pl-14">
          Unicorn Ekosistemi için kural tabanlı dinamik ürün etiketleri
        </p>
      </div>

      <button
        class="group bg-gray-900 text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all font-black flex items-center gap-3 shadow-2xl active:scale-95"
        @click="openModal()"
      >
        <PlusIcon class="h-5 w-5 group-hover:rotate-90 transition-transform" />
        YENİ KURAL OLUŞTUR
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5"
      >
        <div
          :class="stat.iconBg"
          class="p-4 rounded-2xl"
        >
          <component
            :is="stat.icon"
            class="h-6 w-6"
            :class="stat.iconColor"
          />
        </div>
        <div>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {{ stat.label }}
          </p>
          <p class="text-2xl font-black text-gray-900 tracking-tight">
            {{ stat.value }}
          </p>
        </div>
      </div>
    </div>

    <!-- Rules List -->
    <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      <div
        v-if="loading"
        class="p-24 flex flex-col items-center justify-center"
      >
        <div
          class="animate-spin h-12 w-12 border-[6px] border-primary-500 border-t-transparent rounded-full mb-6"
        />
        <p class="text-gray-400 font-black uppercase tracking-widest">
          Veriler Yükleniyor...
        </p>
      </div>

      <div
        v-else-if="rules.length === 0"
        class="p-24 text-center"
      >
        <div class="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <SparklesIcon class="h-12 w-12 text-gray-300" />
        </div>
        <h3 class="text-2xl font-black text-gray-900">
          Henüz kural tanımlanmadı
        </h3>
        <p class="text-gray-500 mt-2 font-medium">
          Platformdaki ürünlere dinamik etiketler atamak için ilk
          kuralınızı oluşturun.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                KOD /
                GÖRÜNÜM
              </th>
              <th class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                POZİSYON
              </th>
              <th class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                ÖNCELİK
              </th>
              <th class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                DURUM
              </th>
              <th
                class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right"
              >
                İŞLEMLER
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 transition-all">
            <tr
              v-for="rule in rules"
              :key="rule.id"
              class="group hover:bg-gray-50/80 transition-all cursor-pointer"
              @click="openModal(rule)"
            >
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div
                    :style="{ backgroundColor: rule.backgroundColor || '#6366f1', color: rule.textColor || '#ffffff' }"
                    class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm transition-transform group-hover:scale-105"
                  >
                    {{ rule.displayText?.tr || rule.displayText }}
                  </div>
                  <div>
                    <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
                      {{
                        rule.code }}
                    </p>
                    <p class="text-[10px] text-gray-300 font-bold">
                      {{
                        rule.targetEcosystem?.join(',') || 'TÜMÜ' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{{
                  rule.position }}</span>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary-500 rounded-full"
                      :style="{ width: rule.priority + '%' }"
                    />
                  </div>
                  <span class="text-[10px] font-black text-gray-400">{{ rule.priority }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <div
                    :class="rule.isActive ? 'bg-green-500' : 'bg-red-400'"
                    class="h-2 w-2 rounded-full animate-pulse"
                  />
                  <span
                    class="text-[10px] font-black uppercase tracking-wider"
                    :class="rule.isActive ? 'text-green-600' : 'text-red-400'"
                  >
                    {{ rule.isActive ? 'AKTİF' : 'PASİF' }}
                  </span>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <div
                  class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    class="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-primary-600"
                    @click.stop="openModal(rule)"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button
                    class="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-red-600"
                    @click.stop="deleteRule(rule.id)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal / Drawer -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-[100] flex justify-end"
    >
      <div
        class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        @click="showModal = false"
      />

      <div
        class="relative w-full max-w-3xl bg-gray-50 h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left"
      >
        <!-- Modal Header -->
        <div class="p-8 bg-white border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">
              {{ editingId ? 'Kuralı Düzenle' : 'Yeni Kural Oluştur' }}
            </h2>
            <p class="text-sm font-medium text-gray-500">
              Kural kriterlerini ve görsel parametreleri
              belirleyin
            </p>
          </div>
          <button
            class="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
            @click="showModal = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AdminBadgeRuleForm v-model="form" />
        </div>

        <!-- Modal Footer -->
        <div class="p-8 bg-white border-t border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="form.isActive"
                type="checkbox"
                class="sr-only peer"
              >
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"
              />
              <span class="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">KURAL
                AKTİF</span>
            </label>
          </div>
          <div class="flex gap-4">
            <button
              class="px-8 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-50 transition-all font-inter"
              @click="showModal = false"
            >
              Vazgeç
            </button>
            <button
              :disabled="saving"
              class="bg-primary-600 text-white px-10 py-4 rounded-2xl hover:bg-primary-700 transition-all font-black shadow-xl shadow-primary-200 active:scale-95 disabled:opacity-50"
              @click="saveRule"
            >
              {{ saving ? 'KAYDEDİLİYOR...' : 'KURALI KAYDET' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    SparklesIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    XMarkIcon,
    CheckBadgeIcon,
    CursorArrowRaysIcon,
    ChartBarIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const rules = ref([])
const editingId = ref(null)

const stats = computed(() => [
    { label: 'Aktif Kurallar', value: (rules.value || []).filter(r => r.isActive).length, icon: CheckBadgeIcon, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Toplam Etkileşim', value: '1.2k', icon: CursorArrowRaysIcon, iconBg: 'bg-primary-50', iconColor: 'text-primary-600' },
    { label: 'Dönüşüm Oranı', value: '%4.2', icon: ChartBarIcon, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' }
])

const form = ref({
    code: '',
    displayText: { tr: '', en: '' },
    position: 'TOP_LEFT',
    priority: 50,
    conditionJson: { field: 'price', operator: 'gt', value: 0 },
    backgroundColor: '#6366f1',
    textColor: '#ffffff',
    targetEcosystem: ['BAZARX'],
    isActive: true
})

const fetchRules = async () => {
    loading.value = true
    try {
        const data = await $api('/api/v1/admin/badge-rules')
        if (data.success) {
            rules.value = data.data || []
        }
    } catch (error) {
        toast.error('Kurallar yüklenirken bir hata oluştu')
        console.error(error)
    } finally {
        loading.value = false
    }
}

const openModal = (rule = null) => {
    if (rule) {
        editingId.value = rule.id
        form.value = JSON.parse(JSON.stringify(rule))
    } else {
        editingId.value = null
        form.value = {
            code: '',
            displayText: { tr: '', en: '' },
            position: 'TOP_LEFT',
            priority: 50,
            conditionJson: { field: 'price', operator: 'gt', value: 0 },
            backgroundColor: '#6366f1',
            textColor: '#ffffff',
            targetEcosystem: ['BAZARX'],
            isActive: true
        }
    }
    showModal.value = true
}

const saveRule = async () => {
    saving.value = true
    try {
        const method = editingId.value ? 'PUT' : 'POST'
        const url = editingId.value ? `/api/v1/admin/badge-rules/${editingId.value}` : '/api/v1/admin/badge-rules'

        const data = await $api(url, {
            method,
            body: form.value
        })

        if (data.success) {
            toast.success(editingId.value ? 'Kural güncellendi' : 'Kural başarıyla oluşturuldu')
            showModal.value = false
            fetchRules()
        }
    } catch (error) {
        toast.error(error.data?.error || 'Kural kaydedilemedi')
    } finally {
        saving.value = false
    }
}

const deleteRule = async (id) => {
    if (!confirm('Bu kuralı silmek istediğinize emin misiniz?')) return
    try {
        const data = await $api(`/api/v1/admin/badge-rules/${id}`, {
            method: 'DELETE'
        })
        if (data.success) {
            toast.success('Kural silindi')
            fetchRules()
        }
    } catch (error) {
        toast.error('Kural silinirken bir hata oluştu')
    }
}

onMounted(() => {
    fetchRules()
})
</script>

<style scoped>
@keyframes slide-left {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.animate-slide-left {
    animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}
</style>
