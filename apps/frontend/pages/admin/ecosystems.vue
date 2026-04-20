<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header & Stats Summary -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheckIcon class="h-8 w-8 text-indigo-600" />
            Watchtower Admin Dashboard
          </h1>
          <p class="text-slate-500 font-medium">
            BazarX Private Ekosistemleri ve Akıllı Kota Denetimi
          </p>
        </div>

        <div class="flex gap-3">
          <button
            class="bg-white border border-slate-200 p-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            @click="fetchData"
          >
            <ArrowPathIcon
              class="h-5 w-5 text-slate-600"
              :class="{ 'animate-spin': loading }"
            />
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Aktif
            Ekosistemler</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black text-slate-900">{{ ecosystems.length }}</span>
            <span class="text-xs font-bold text-indigo-600">Apex+</span>
          </div>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Toplam Private
            Stok</span>
          <div class="mt-2">
            <span class="text-3xl font-black text-slate-900">{{ formatNumber(totalPrivateStock) }}</span>
            <span class="text-xs font-bold text-slate-500 block">Kör Havuz Miktarı</span>
          </div>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Toplam Envanter
            Değeri</span>
          <div class="mt-2">
            <span class="text-3xl font-black text-indigo-600">{{ formatCurrency(totalInventoryValue)
            }}</span>
          </div>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Son 24s İhlal</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black text-rose-600">{{ recentViolations }}</span>
            <span class="text-xs font-bold text-rose-400">Uyarı</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Ecosystems List -->
        <div class="lg:col-span-2 space-y-4">
          <h2 class="text-sm font-black text-slate-400 uppercase tracking-widest px-1">
            Marka Ekosistemleri
          </h2>
          <div
            v-if="loading && !ecosystems.length"
            class="animate-pulse space-y-4"
          >
            <div
              v-for="i in 3"
              :key="i"
              class="h-24 bg-white rounded-3xl border border-slate-100"
            />
          </div>
          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="eco in ecosystems"
              :key="eco.id"
              class="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative cursor-pointer"
              :class="{ 'ring-2 ring-indigo-500': selectedEco?.id === eco.id }"
              @click="selectEcosystem(eco)"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600"
                  >
                    {{ eco.name.charAt(0) }}
                  </div>
                  <div>
                    <h3 class="font-black text-slate-900">
                      {{ eco.name }}
                    </h3>
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-tight">
                      {{
                        eco.Owner?.businessName }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-black text-slate-900">
                    {{
                      formatCurrency(eco.stats.totalValue) }}
                  </div>
                  <div class="text-[10px] font-black text-slate-400 uppercase">
                    {{ eco.stats.totalStok
                    }} Adet Stok
                  </div>
                </div>
              </div>
              <div class="mt-4 flex gap-2">
                <span class="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-lg">{{
                  eco.stats.memberCount }} Üye</span>
                <span class="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-lg">{{
                  eco.stats.listingCount }} Ürün</span>
                <span
                  v-if="eco.stats.logCount > 0"
                  class="bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-1 rounded-lg"
                >{{
                  eco.stats.logCount }} Olay</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions & Member Details -->
        <div class="space-y-8">
          <!-- Selected Ecosystem Details -->
          <div
            v-if="selectedEco"
            class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 sticky top-8"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-black text-slate-900 tracking-tight">
                {{ selectedEco.name }}
              </h2>
              <button
                class="text-slate-400 hover:text-slate-600"
                @click="selectedEco = null"
              >
                ✕
              </button>
            </div>

            <div class="space-y-4">
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Ekosistem
                Üyeleri
              </h3>
              <div class="divide-y divide-slate-50">
                <div
                  v-for="member in selectedEco.Members"
                  :key="member.id"
                  class="py-3 flex items-center justify-between"
                >
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-800 leading-tight">{{
                      member.businessName }}</span>
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{{
                      member.tier }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex flex-col items-end">
                      <span
                        class="text-xs font-black"
                        :class="getTrustScoreColor(member.trustScore)"
                      >{{ member.trustScore
                      }}%</span>
                      <span
                        class="text-[8px] text-slate-400 uppercase font-black tracking-widest"
                      >TrustScore</span>
                    </div>
                    <div class="flex gap-1">
                      <button
                        class="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600"
                        title="Skoru Değiştir"
                        @click="openOverrideModal(member)"
                      >
                        <WrenchScrewdriverIcon class="h-4 w-4" />
                      </button>
                      <button
                        class="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                        title="Üyeliği Sil"
                        @click="removeMember(member.id)"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-50 flex flex-col gap-2">
              <button
                class="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                @click="viewLogs(selectedEco.id)"
              >
                Audit Loglarını Görüntüle
              </button>
            </div>
          </div>

          <!-- Quick Actions if no selection -->
          <div
            v-else
            class="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg space-y-4"
          >
            <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <BoltIcon class="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 class="font-black text-lg leading-tight">
                Watchtower Hazır
              </h3>
              <p class="text-indigo-100 text-xs font-medium leading-relaxed mt-1">
                Eko-sistem bazlı denetim
                yapmak için sol taraftan bir marka seçin.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Audit Logs Section -->
      <div
        v-if="showLogs"
        class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
      >
        <div class="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest">
            Sistem Audit Logları
            (Watchtower)
          </h2>
          <button
            class="text-xs font-black text-slate-400 hover:text-slate-600 uppercase"
            @click="showLogs = false"
          >
            Kapat
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50/50">
              <tr>
                <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Tarih
                </th>
                <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Olay
                </th>
                <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Satıcı / Ekosistem
                </th>
                <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Önem
                </th>
                <th class="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Detaylar
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="log in auditLogs"
                :key="log.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">
                  {{ formatDate(log.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-xs font-black text-slate-800">{{ formatAction(log.action)
                  }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-900">{{ log.Vendor?.businessName ||
                      'Sistem' }}</span>
                    <span class="text-[9px] font-black text-indigo-600 uppercase tracking-tight">{{
                      log.Ecosystem?.name || 'Genel' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getSeverityColor(log.severity)"
                    class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                  >
                    {{ formatSeverity(log.severity) }}
                  </span>
                </td>
                <td class="px-6 py-4 min-w-[250px] max-w-md whitespace-normal">
                  <div
                    v-if="typeof log.details === 'object' && log.details !== null"
                    class="flex flex-wrap gap-1.5"
                  >
                    <div
                      v-for="(val, key) in log.details"
                      :key="key"
                      class="flex items-center bg-slate-100/80 border border-slate-200/60 rounded-md px-2 py-1 text-[10px] text-slate-700 shadow-sm"
                    >
                      <span class="text-slate-400 mr-1.5 uppercase font-black tracking-wider">{{
                        formatLogKey(key) }}:</span>
                      <span class="font-bold">{{ formatLogValue(val) }}</span>
                    </div>
                  </div>
                  <span
                    v-else
                    class="text-xs font-medium text-slate-600 truncate max-w-xs block"
                    :title="String(log.details)"
                  >{{
                    log.details || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Override Modal -->
    <Teleport to="body">
      <div
        v-if="showOverrideModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          @click="showOverrideModal = false"
        />
        <div class="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <h3 class="text-2xl font-black text-slate-900 tracking-tight">
              TrustScore Override
            </h3>
            <p class="text-slate-500 font-medium text-sm">
              {{ targetMember.businessName }} için puan
              müdahalesi.
            </p>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yeni
                Skor (0-100)</label>
              <input
                v-model="overrideScore"
                type="number"
                min="0"
                max="100"
                class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-black focus:ring-2 focus:ring-indigo-500 transition-all text-xl"
              >
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sebep /
                Gerekçe</label>
              <textarea
                v-model="overrideReason"
                rows="3"
                class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Bu değişiklik Watchtower loglarına işlenecektir..."
              />
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 bg-slate-100 text-slate-600 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
              @click="showOverrideModal = false"
            >
              İptal
            </button>
            <button
              :disabled="submitting"
              class="flex-2 bg-indigo-600 text-white py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              @click="submitOverride"
            >
              {{ submitting ? 'Kaydediliyor...' : 'Skoru Güncelle' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
    ShieldCheckIcon,
    ArrowPathIcon,
    BoltIcon,
    WrenchScrewdriverIcon,
        TrashIcon
} from '@heroicons/vue/24/solid'

definePageMeta({
    layout: 'admin',
    middleware: 'super-admin',
})

const { $api } = useApi()
const { $toast } = useNuxtApp()

const ecosystems = ref([])
const auditLogs = ref([])
const loading = ref(false)
const showLogs = ref(false)
const selectedEco = ref(null)

// Stats
const totalPrivateStock = computed(() => ecosystems.value.reduce((s, e) => s + (e.stats?.totalStok || 0), 0))
const totalInventoryValue = computed(() => ecosystems.value.reduce((s, e) => s + (e.stats?.totalValue || 0), 0))
const recentViolations = computed(() => auditLogs.value.filter(l => l.severity !== 'INFO').length)

// Override Modal
const showOverrideModal = ref(false)
const targetMember = ref(null)
const overrideScore = ref(100)
const overrideReason = ref('')
const submitting = ref(false)

const fetchData = async () => {
    loading.value = true
    try {
        const [ecoRes, logRes] = await Promise.all([
            $api('/api/v1/admin/ecosystems'),
            $api('/api/v1/admin/ecosystems/logs')
        ])
        ecosystems.value = ecoRes.ecosystems || []
        auditLogs.value = logRes.logs || []

        if (selectedEco.value) {
            const updated = ecosystems.value.find(e => e.id === selectedEco.value.id)
            if (updated) selectedEco.value = updated
        }
    } catch (err) {
        $toast.error('Veriler yüklenemedi')
    } finally {
        loading.value = false
    }
}

const selectEcosystem = (eco) => {
    selectedEco.value = eco
}

const viewLogs = () => {
    showLogs.value = true
}

const openOverrideModal = (member) => {
    targetMember.value = member
    overrideScore.value = member.trustScore
    overrideReason.value = ''
    showOverrideModal.value = true
}

const submitOverride = async () => {
    if (submitting.value) return
    submitting.value = true
    try {
        await $api('/api/v1/admin/ecosystems/trust-score', {
            method: 'POST',
            body: {
                vendorId: targetMember.value.id,
                newScore: overrideScore.value,
                reason: overrideReason.value
            }
        })
        $toast.success('TrustScore başarıyla güncellendi')
        showOverrideModal.value = false
        await fetchData()
    } catch (err) {
        $toast.error('Hata: ' + (err.data?.error || err.message))
    } finally {
        submitting.value = false
    }
}

const removeMember = async (vendorId) => {
    if (!confirm('Bu üyeyi ekosistemden çıkarmak istediğinize emin misiniz?')) return
    try {
        await $api(`/api/v1/admin/ecosystems/members/${vendorId}`, {
            method: 'DELETE'
        })
        $toast.success('Üye başarıyla çıkarıldı')
        await fetchData()
    } catch (err) {
        $toast.error('Hata: ' + (err.data?.error || err.message))
    }
}

// Helpers
const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
const formatNumber = (val) => new Intl.NumberFormat('tr-TR').format(val || 0)
const formatDate = (date) => new Date(date).toLocaleString('tr-TR')
const formatLogKey = (key) => {
    const map = {
        isUpdate: 'Güncelleme',
        quantity: 'Miktar',
        listingId: 'İlan ID',
        listingName: 'Ürün Adı',
        oldScore: 'Eski Skor',
        newScore: 'Yeni Skor',
        reason: 'Sebep',
        vendorId: 'Satıcı ID',
        productId: 'Ürün ID',
        ecosystemId: 'Ekosistem',
        status: 'Durum',
        type: 'Tip',
        amount: 'Tutar'
    }
    return map[key] || key
}

const formatAction = (action) => {
    const map = {
        CART_ADD: 'SEPETE EKLEME',
        CART_UPDATE: 'SEPET GÜNCELLEME',
        VISIBILITY_VIOLATION: 'GÖRÜNÜRLÜK İHLALİ',
        COMMISSION_APPLY: 'KOMİSYON UYGULANDI',
        SMART_CAP_FAIL: 'AKILLI LİMİT İHLALİ',
        PRICE_FLOOR_FAIL: 'TABAN FİYAT İHLALİ',
        PRICE_FLOOR_DEVIATION: 'TABAN FİYAT SAPMASI',
        MEMBER_ADDED: 'BAYİ EKLENDİ',
        MEMBER_REMOVED: 'BAYİ ÇIKARILDI',
        TRUST_SCORE_OVERRIDE: 'GÜVEN SKORU DEĞİŞİMİ',
        XP_BURN: 'XP YAKIMI',
        XP_EXPIRATION_WARNING: 'XP SÜRE SONU UYARISI'
    }
    return map[action] || action
}

const formatSeverity = (sev) => {
    const map = {
        INFO: 'BİLGİ',
        WARN: 'UYARI',
        CRITICAL: 'KRİTİK'
    }
    return map[sev] || sev
}

const formatLogValue = (val) => {
    if (typeof val === 'boolean') return val ? 'Evet' : 'Hayır'
    return val
}

const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500'
    if (score >= 70) return 'text-blue-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-rose-500'
}

const getSeverityColor = (sev) => {
    switch (sev) {
        case 'CRITICAL': return 'bg-rose-600 text-white'
        case 'WARN': return 'bg-orange-100 text-orange-600'
        default: return 'bg-slate-100 text-slate-600'
    }
}

onMounted(fetchData)
</script>

<style scoped>
.flex-2 {
    flex: 2;
}
</style>
