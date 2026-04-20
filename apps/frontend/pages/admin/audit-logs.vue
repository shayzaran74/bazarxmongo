<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
          Yönetici Denetim Kayıtları
        </h1>
        <p class="text-gray-500 mt-1">
          Sistem üzerindeki tüm yönetici aksiyonlarını takip edin
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50"
          @click="fetchLogs"
        >
          <ArrowPathIcon
            class="h-5 w-5 mr-2"
            :class="{ 'animate-spin': loading }"
          />
          Yenile
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="space-y-1">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">İşlem Tipi</label>
        <select
          v-model="filters.action"
          class="w-full bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-form focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
        >
          <option value="">
            Tüm İşlemler
          </option>
          <option
            v-for="action in actionTypes"
            :key="action"
            :value="action"
          >
            {{ action }}
          </option>
        </select>
      </div>
      <div class="space-y-1 md:col-span-2">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Arama (Neden, IP,
          Admin)</label>
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Kelime ile ara..."
            class="w-full bg-gray-50 border-0 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            @keyup.enter="fetchLogs"
          >
        </div>
      </div>
      <div class="flex items-end">
        <button
          class="w-full bg-indigo-600 text-white rounded-xl px-4 py-2.5 font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          @click="fetchLogs"
        >
          Filtrele
        </button>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Zaman
              </th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Yönetici
              </th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                İşlem
              </th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Hedef ID
              </th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                IP / Bilgi
              </th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                Detay
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <template v-if="loading">
              <tr
                v-for="i in 5"
                :key="i"
                class="animate-pulse"
              >
                <td
                  v-for="j in 6"
                  :key="j"
                  class="px-6 py-4 italic text-gray-200"
                >
                  ...
                </td>
              </tr>
            </template>
            <tr
              v-else-if="logs.length === 0"
              class="hover:bg-gray-50"
            >
              <td
                colspan="6"
                class="px-6 py-12 text-center"
              >
                <div class="flex flex-col items-center opacity-40">
                  <ClipboardDocumentCheckIcon class="h-12 w-12 mb-3" />
                  <p class="text-sm font-medium">
                    Kayıt bulunamadı
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-gray-50 group transition-colors"
            >
              <td class="px-6 py-4">
                <div class="text-sm font-semibold text-gray-900">
                  {{ formatDate(log.createdAt) }}
                </div>
                <div class="text-[10px] text-gray-400 uppercase">
                  {{ formatTime(log.createdAt) }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div
                    class="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3"
                  >
                    {{ log.admin?.name?.charAt(0) || 'A' }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900 leading-none">
                      {{ log.admin?.name }}
                    </div>
                    <div class="text-xs text-gray-400 mt-1">
                      {{ log.admin?.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getActionBadgeClass(log.action)"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div
                  class="text-sm font-mono text-gray-500 truncate max-w-[120px]"
                  :title="log.targetId || log.targetUserId"
                >
                  {{ log.targetId || log.targetUserId || '-' }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ log.ip }}
                </div>
                <div
                  class="text-xs text-gray-400 truncate max-w-[180px]"
                  :title="log.userAgent"
                >
                  {{
                    log.reason || log.userAgent || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="text-indigo-600 hover:text-indigo-800 font-bold text-xs uppercase tracking-widest"
                  @click="showDetails(log)"
                >
                  GÖRÜNTÜLE
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.pages > 1"
        class="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between"
      >
        <div class="text-xs font-bold text-gray-400">
          Toplam {{ pagination.total }} kayıt arasından {{ (pagination.page - 1) * pagination.limit + 1 }} -
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} gösteriliyor
        </div>
        <div class="flex items-center space-x-2">
          <button
            :disabled="pagination.page === 1"
            class="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors"
            @click="changePage(pagination.page - 1)"
          >
            <ChevronLeftIcon class="h-4 w-4" />
          </button>
          <div
            class="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm"
          >
            {{ pagination.page }} / {{ pagination.pages }}
          </div>
          <button
            :disabled="pagination.page === pagination.pages"
            class="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors"
            @click="changePage(pagination.page + 1)"
          >
            <ChevronRightIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <TransitionRoot
      appear
      :show="isModalOpen"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-50"
        @close="isModalOpen = false"
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
          <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
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
                class="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all border border-gray-100"
              >
                <div class="flex justify-between items-center mb-6">
                  <DialogTitle
                    as="h3"
                    class="text-xl font-black text-gray-900 uppercase tracking-tight"
                  >
                    KAYIT DETAYI
                  </DialogTitle>
                  <button
                    class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    @click="isModalOpen = false"
                  >
                    <XMarkIcon class="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                <div
                  v-if="selectedLog"
                  class="space-y-6"
                >
                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label
                        class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1"
                      >İŞLEM</label>
                      <span
                        :class="getActionBadgeClass(selectedLog.action)"
                        class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border inline-block"
                      >
                        {{ selectedLog.action }}
                      </span>
                    </div>
                    <div>
                      <label
                        class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1"
                      >ZAMAN</label>
                      <div class="text-sm font-bold text-gray-900">
                        {{
                          formatDate(selectedLog.createdAt) }} {{
                          formatTime(selectedLog.createdAt) }}
                      </div>
                    </div>
                  </div>

                  <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <label
                      class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2"
                    >HEDEF
                      VERİ (AFTER)</label>
                    <pre
                      class="text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap"
                    >{{ selectedLog.afterValue || 'Veri bulunamadı' }}</pre>
                  </div>

                  <div
                    v-if="selectedLog.beforeValue"
                    class="p-4 bg-red-50/50 rounded-2xl border border-red-100"
                  >
                    <label
                      class="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-2"
                    >ÖNCEKİ
                      VERİ (BEFORE)</label>
                    <pre
                      class="text-xs font-mono text-gray-700 overflow-x-auto whitespace-pre-wrap"
                    >{{ selectedLog.beforeValue }}</pre>
                  </div>

                  <div
                    class="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100"
                  >
                    <div>
                      <label
                        class="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1"
                      >BİRİM
                        / MİKTAR</label>
                      <div class="text-xl font-black text-indigo-700">
                        {{ selectedLog.amount || '-'
                        }}
                      </div>
                    </div>
                    <div class="text-right">
                      <label
                        class="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1"
                      >YÖNETİCİ
                        IP</label>
                      <div class="text-sm font-bold text-gray-900">
                        {{ selectedLog.ip }}
                      </div>
                    </div>
                  </div>

                  <div v-if="selectedLog.reason">
                    <label
                      class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1"
                    >NEDEN
                      / NOT</label>
                    <div
                      class="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-medium text-gray-700"
                    >
                      {{ selectedLog.reason }}
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import {
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentCheckIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline'
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionChild,
    TransitionRoot,
} from '@headlessui/vue'

definePageMeta({
    layout: 'admin',
    middleware: 'super-admin'
})

useHead({
    title: 'Yönetici Denetim Kayıtları - Admin Panel'
})

const { $api } = useApi()
const loading = ref(false)
const logs = ref([])
const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
})

const filters = ref({
    action: '',
    search: ''
})

const actionTypes = [
    'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
    'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
    'APPROVE_TOPUP', 'REJECT_TOPUP',
    'APPROVE_WITHDRAWAL', 'REJECT_WITHDRAWAL',
    'MANUAL_BALANCE_CHANGE', 'MANUAL_XP_CHANGE',
    'UPDATE_USER', 'DELETE_USER',
    'APPROVE_CHAIN', 'DELETE_CHAIN',
    'CONNECT_MATCH', 'UPDATE_MATCH_STATUS',
    'UPDATE_ORDER_STATUS', 'APPROVE_PAYOUT',
    'RECONCILE', 'ANOMALY_BURST_REQUESTS'
]

const fetchLogs = async () => {
    loading.value = true
    try {
        const params = new URLSearchParams({
            page: pagination.value.page,
            limit: pagination.value.limit,
            ...filters.value
        })

        const response = await $api(`/api/v1/admin/logs/audit?${params.toString()}`)
        if (response.success) {
            logs.value = response.data
            pagination.value = response.pagination
        }
    } catch (error) {
        console.error('Audit logs fetch error:', error)
        useNuxtApp().$toast.error('Kayıtlar yüklenirken bir hata oluştu.')
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    pagination.value.page = page
    fetchLogs()
}

const isModalOpen = ref(false)
const selectedLog = ref(null)

const showDetails = (log) => {
    selectedLog.value = log
    isModalOpen.value = true
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getActionBadgeClass = (action) => {
    if (action.includes('CREATE')) return 'bg-green-50 text-green-700 border-green-100'
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-100'
    if (action.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-100'
    if (action.includes('APPROVE')) return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    if (action.includes('REJECT')) return 'bg-orange-50 text-orange-700 border-orange-100'
    if (action.includes('XP') || action.includes('BALANCE')) return 'bg-purple-50 text-purple-700 border-purple-100'
    if (action.includes('ANOMALY')) return 'bg-black text-yellow-400 border-black animate-pulse font-black'
    return 'bg-gray-50 text-gray-700 border-gray-200'
}

onMounted(() => {
    fetchLogs()
})
</script>

<style scoped>
.text-form {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}
</style>
