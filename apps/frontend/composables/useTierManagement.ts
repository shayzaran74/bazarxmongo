// composables/useTierManagement.ts

type B2BTier = 'CORE' | 'PRIME' | 'ELITE' | 'APEX'

interface TierForm {
  id?: string
  tier: B2BTier
  commissionCash: number
  commissionBarter: number
  burnRate: number
  annualFee: number
  listingLimit: number
  excelBatchLimit: number
  apiRatePerMin: number
  archiveAfterDays: number
  imageCountPerListing: number
  roiRate: number
  xpMultiplier: number
}

interface TierRecord extends TierForm {
  createdAt?: string
  updatedAt?: string
}

const DEFAULT_FORM: TierForm = {
  tier: 'CORE',
  commissionCash: 0.12,
  commissionBarter: 0.08,
  burnRate: 0.5,
  annualFee: 12000,
  listingLimit: 100,
  excelBatchLimit: 50,
  apiRatePerMin: 60,
  archiveAfterDays: 365,
  imageCountPerListing: 5,
  roiRate: 0.5,
  xpMultiplier: 1.0,
}

export const useTierManagement = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast

  const tiers = ref<TierRecord[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const resetting = ref(false)
  const showModal = ref(false)
  const form = ref<TierForm>({ ...DEFAULT_FORM })

  const fetchTiers = async (): Promise<void> => {
    loading.value = true
    try {
      const data = await $api<{ success: boolean; data: TierRecord[] }>('/api/v1/admin/tiers')
      if (data.success) tiers.value = data.data ?? []
    } catch {
      toast.error('Tier verileri yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const resetCache = async (): Promise<void> => {
    resetting.value = true
    try {
      await $api('/api/v1/admin/tiers/cache', { method: 'DELETE' })
      toast.success('Önbellek temizlendi')
      await fetchTiers()
    } catch {
      toast.error('Önbellek temizlenemedi')
    } finally {
      resetting.value = false
    }
  }

  const saveTier = async (): Promise<void> => {
    saving.value = true
    try {
      const payload: TierForm = { ...form.value }
      await $api('/api/v1/admin/tiers', { method: 'POST', body: payload })
      toast.success('Kural başarıyla kaydedildi')
      showModal.value = false
      await fetchTiers()
    } catch (error: unknown) {
      const msg = (error as { data?: { error?: string } })?.data?.error
      toast.error(msg ?? 'Kural kaydedilemedi')
    } finally {
      saving.value = false
    }
  }

  const openModal = (tier: TierRecord): void => {
    // MongoDB Decimal128 nesnelerini sayıya dönüştür
    const parsed: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(tier)) {
      parsed[k] = (typeof v === 'object' && v !== null && '$numberDecimal' in (v as object))
        ? parseFloat((v as { $numberDecimal: string }).$numberDecimal)
        : v
    }
    form.value = parsed as unknown as TierForm
    showModal.value = true
  }

  return {
    tiers,
    loading,
    saving,
    resetting,
    showModal,
    form,
    fetchTiers,
    resetCache,
    saveTier,
    openModal,
  }
}
