<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 min-h-screen">

    <!-- Başlık -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500">YÖNETİM PANELİ</span>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mt-1">
          Sadakat & <span class="text-indigo-600">XP</span> Sistemi
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">
          XP KAZANIM KURALLARI · DAĞITIM MODELİ · HARCAMA LİMİTLERİ
        </p>
      </div>
    </div>

    <!-- Sekmeler -->
    <div class="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
      <button
        v-for="tab in TABS" :key="tab.id"
        class="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        :class="activeTab === tab.id
          ? 'bg-gray-900 text-white shadow-lg'
          : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── SEKME 1: Genel XP Ayarları ──────────────────────────────────────── -->
    <div v-show="activeTab === 'general'" class="space-y-8">

      <div class="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
        <h3 class="text-sm font-black text-blue-900 mb-1">XP Dağılım Modelini Yönetme</h3>
        <p class="text-xs text-blue-700 leading-relaxed">
          Küresel XP kazanım ödüllerini ve harcama oranlarını buradan yapılandırın.
          Ondalıklı değerler girin (Örn: %50 için 0.50).
        </p>
      </div>

      <!-- Basit Görev Ödülleri -->
      <div class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6">
        <h2 class="text-sm font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
          🏆 Basit XP Kazanım Görevleri
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="field in SIMPLE_FIELDS" :key="field.key" class="bg-gray-50/50 rounded-xl p-5 border border-gray-100 space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ field.label }}</label>
            <input
              v-model.number="settings[field.key as keyof typeof settings]"
              type="number" :step="field.step ?? 1"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Küresel Split Limitleri -->
      <div class="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6">
        <h2 class="text-sm font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
          🌍 Küresel Dağıtım Üst Limitleri
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="field in SPLIT_FIELDS" :key="field.key" class="bg-gray-50/50 rounded-xl p-5 border border-gray-100 space-y-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ field.label }}</label>
            <p v-if="field.hint" class="text-[9px] text-gray-400 leading-tight">{{ field.hint }}</p>
            <input
              v-model.number="settings[field.key as keyof typeof settings]"
              type="number" step="0.01" min="0" max="1"
              class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          :disabled="savingGeneral"
          class="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50 active:scale-95"
          @click="saveGeneral"
        >
          {{ savingGeneral ? 'KAYDEDİLİYOR...' : 'GENEL AYARLARI KAYDET' }}
        </button>
      </div>
    </div>

    <!-- ── SEKME 2: XP Dağıtım Kuralları ──────────────────────────────────── -->
    <div v-show="activeTab === 'distribution'" class="space-y-6">
      <div class="flex justify-end">
        <button
          class="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
          @click="openDistModal()"
        >+ Yeni Kural Ekle</button>
      </div>

      <XpDistributionTab :rules="distRules" :loading="loadingDist" />
    </div>

    <!-- ── SEKME 3: XP Harcama Limitleri ──────────────────────────────────── -->
    <div v-show="activeTab === 'spending'" class="space-y-6">
      <XpSpendingTab
        :limits="spendingRules"
        :loading="loadingSpending"
        @edit="openSpendModal"
        @create="openSpendModal()"
      />
    </div>

    <!-- ── XP Dağıtım Kural Modalı ────────────────────────────────────────── -->
    <XpDistRuleModal
      :is-open="distModal.open"
      :form="distModal.form"
      :pct-total="distPctTotal"
      :loading="distModal.saving"
      @close="distModal.open = false"
      @save="saveDistRule"
    />

    <!-- ── XP Harcama Limit Modalı ────────────────────────────────────────── -->
    <XpLimitModal
      :is-open="spendModal.open"
      :form="spendModal.form"
      :loading="spendModal.saving"
      @close="spendModal.open = false"
      @save="saveSpendRule"
    />

  </div>
</template>

<script setup lang="ts">
import XpDistributionTab from '~/components/admin/xp/XpDistributionTab.vue'
import XpSpendingTab     from '~/components/admin/xp/XpSpendingTab.vue'
import XpDistRuleModal   from '~/components/admin/xp/XpDistRuleModal.vue'
import XpLimitModal      from '~/components/admin/xp/XpLimitModal.vue'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Sadakat & XP Sistemi — Admin | BazarX' })

// ── Tipler ──────────────────────────────────────────────────────────────────

interface GeneralSettings {
  reward_xp_daily_login: number
  reward_xp_product_listed: number
  reward_xp_profile_completed: number
  max_xp_burn_rate: number
  xp_split_commission: number
  xp_split_ad: number
  xp_split_service: number
}

interface DistRule {
  id?: string
  name: string
  city: string
  tier: string
  commissionPct: number
  adPct: number
  servicePct: number
  priority: number
  isActive: boolean
}

interface SpendRule {
  id?: string
  isNew?: boolean
  tier: string
  maxXpPerTransactionPct: number
  monthlyVolumeThreshold: number
  boostedDailyXpLimit: number
  isActive: boolean
}

// ── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'general',      label: 'Genel Ayarlar' },
  { id: 'distribution', label: 'Dağıtım Kuralları' },
  { id: 'spending',     label: 'Harcama Limitleri' },
]

const SIMPLE_FIELDS = [
  { key: 'reward_xp_daily_login',       label: 'Günlük Giriş Ödülü (XP)' },
  { key: 'reward_xp_product_listed',    label: 'Yeni Ürün Girişi (XP)' },
  { key: 'reward_xp_profile_completed', label: 'Profil Tamamlama (XP)' },
]

const SPLIT_FIELDS = [
  { key: 'max_xp_burn_rate',    label: 'Maks Harcama Oranı', hint: 'Sepetin en fazla yüzde kaçı XP ile ödenebilir?' },
  { key: 'xp_split_commission', label: 'Komisyon Dağılımı',  hint: 'Dağıtılan XP\'nin komisyona dönüşme oranı' },
  { key: 'xp_split_ad',         label: 'Reklam Dağılımı',   hint: 'Dağıtılan XP\'nin reklama dönüşme oranı' },
  { key: 'xp_split_service',    label: 'Servis Dağılımı',   hint: 'Dağıtılan XP\'nin servislere dönüşme oranı' },
]

const DEFAULT_DIST_FORM = (): DistRule => ({
  name: '', city: '', tier: '', commissionPct: 50, adPct: 25, servicePct: 25, priority: 0, isActive: true,
})

const DEFAULT_SPEND_FORM = (): SpendRule => ({
  isNew: true, tier: 'CORE', maxXpPerTransactionPct: 20, monthlyVolumeThreshold: 100000, boostedDailyXpLimit: 5000, isActive: true,
})

// ── State ────────────────────────────────────────────────────────────────────

const { $api } = useApi()
const toast = useNuxtApp().$toast

const activeTab    = ref<'general' | 'distribution' | 'spending'>('general')
const savingGeneral = ref(false)
const loadingDist   = ref(false)
const loadingSpending = ref(false)

const settings = ref<GeneralSettings>({
  reward_xp_daily_login: 50,
  reward_xp_product_listed: 10,
  reward_xp_profile_completed: 50,
  max_xp_burn_rate: 0.25,
  xp_split_commission: 0.50,
  xp_split_ad: 0.25,
  xp_split_service: 0.25,
})

const distRules    = ref<DistRule[]>([])
const spendingRules = ref<SpendRule[]>([])

const distModal = reactive({ open: false, saving: false, form: DEFAULT_DIST_FORM() })
const spendModal = reactive({ open: false, saving: false, form: DEFAULT_SPEND_FORM() })

const distPctTotal = computed(() =>
  distModal.form.commissionPct + distModal.form.adPct + distModal.form.servicePct
)

// ── Genel Ayarlar ────────────────────────────────────────────────────────────

const fetchGeneral = async (): Promise<void> => {
  try {
    const res = await $api<{ success: boolean; data: Record<string, unknown> }>('/api/v1/admin/settings')
    const d = res?.data ?? {}
    if (d.reward_xp_daily_login    !== undefined) settings.value.reward_xp_daily_login    = Number(d.reward_xp_daily_login)
    if (d.reward_xp_product_listed !== undefined) settings.value.reward_xp_product_listed = Number(d.reward_xp_product_listed)
    if (d.reward_xp_profile_completed !== undefined) settings.value.reward_xp_profile_completed = Number(d.reward_xp_profile_completed)
    if (d.MAX_XP_BURN_RATE         !== undefined) settings.value.max_xp_burn_rate         = Number(d.MAX_XP_BURN_RATE)
    if (d.XP_SPLIT_COMMISSION      !== undefined) settings.value.xp_split_commission      = Number(d.XP_SPLIT_COMMISSION)
    if (d.XP_SPLIT_AD              !== undefined) settings.value.xp_split_ad              = Number(d.XP_SPLIT_AD)
    if (d.XP_SPLIT_SERVICE         !== undefined) settings.value.xp_split_service         = Number(d.XP_SPLIT_SERVICE)
  } catch {
    toast.error('Genel ayarlar yüklenemedi')
  }
}

const saveGeneral = async (): Promise<void> => {
  savingGeneral.value = true
  try {
    const s = settings.value
    await $api('/api/v1/admin/settings', {
      method: 'POST',
      body: {
        reward_xp_daily_login:       String(s.reward_xp_daily_login),
        reward_xp_product_listed:    String(s.reward_xp_product_listed),
        reward_xp_profile_completed: String(s.reward_xp_profile_completed),
        MAX_XP_BURN_RATE:            String(s.max_xp_burn_rate),
        XP_SPLIT_COMMISSION:         String(s.xp_split_commission),
        XP_SPLIT_AD:                 String(s.xp_split_ad),
        XP_SPLIT_SERVICE:            String(s.xp_split_service),
      },
    })
    toast.success('Genel XP ayarları kaydedildi')
  } catch {
    toast.error('Ayarlar kaydedilemedi')
  } finally {
    savingGeneral.value = false
  }
}

// ── Dağıtım Kuralları ────────────────────────────────────────────────────────

const fetchDistRules = async (): Promise<void> => {
  loadingDist.value = true
  try {
    const res = await $api<{ success: boolean; data: DistRule[] }>('/api/v1/admin/loyalty/distribution-rules')
    distRules.value = res.data ?? []
  } catch {
    toast.error('Dağıtım kuralları yüklenemedi')
  } finally {
    loadingDist.value = false
  }
}

const openDistModal = (rule?: DistRule): void => {
  distModal.form = rule ? { ...rule } : DEFAULT_DIST_FORM()
  distModal.open = true
}

const saveDistRule = async (): Promise<void> => {
  if (distPctTotal.value !== 100) return
  distModal.saving = true
  try {
    const method = distModal.form.id ? 'PUT' : 'POST'
    const url = distModal.form.id
      ? `/api/v1/admin/loyalty/distribution-rules/${distModal.form.id}`
      : '/api/v1/admin/loyalty/distribution-rules'
    await $api(url, { method, body: distModal.form })
    toast.success('Dağıtım kuralı kaydedildi')
    distModal.open = false
    await fetchDistRules()
  } catch {
    toast.error('Kural kaydedilemedi')
  } finally {
    distModal.saving = false
  }
}

// ── Harcama Limitleri ────────────────────────────────────────────────────────

const fetchSpendingRules = async (): Promise<void> => {
  loadingSpending.value = true
  try {
    const res = await $api<{ success: boolean; data: SpendRule[] }>('/api/v1/admin/loyalty/spending-rules')
    spendingRules.value = res.data ?? []
  } catch {
    toast.error('Harcama limitleri yüklenemedi')
  } finally {
    loadingSpending.value = false
  }
}

const openSpendModal = (rule?: SpendRule): void => {
  spendModal.form = rule ? { ...rule, isNew: false } : DEFAULT_SPEND_FORM()
  spendModal.open = true
}

const saveSpendRule = async (): Promise<void> => {
  spendModal.saving = true
  try {
    const method = spendModal.form.id ? 'PUT' : 'POST'
    const url = spendModal.form.id
      ? `/api/v1/admin/loyalty/spending-rules/${spendModal.form.id}`
      : '/api/v1/admin/loyalty/spending-rules'
    await $api(url, { method, body: spendModal.form })
    toast.success('Limit kuralı kaydedildi')
    spendModal.open = false
    await fetchSpendingRules()
  } catch {
    toast.error('Limit kaydedilemedi')
  } finally {
    spendModal.saving = false
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

onMounted(() => {
  fetchGeneral()
  fetchDistRules()
  fetchSpendingRules()
})
</script>
