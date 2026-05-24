// apps/frontend/composables/useAdminEcosystems.ts
// Sprint 4: Strict TypeScript typing — tüm `any` tipleri kaldırıldı

import { ref, computed, onMounted } from 'vue'

export interface CommissionStats {
  internalCommRate: number
  estimatedTotalCommission: number
  currency: string
}

export interface AdminEcosystemStats {
  totalValue: number
  totalStok: number
  memberCount: number
  listingCount: number
  logCount: number
  commissionStats: CommissionStats
}

export interface AdminEcosystem {
  id: string
  name?: string
  slug?: string
  description?: string
  status?: string
  internalCommRate: number
  isBlindPool: boolean
  logoUrl?: string
  createdAt?: string
  updatedAt?: string
  Owner: { businessName: string }
  stats: AdminEcosystemStats
  Members: AdminEcosystemMember[]
}

export interface AdminEcosystemMember {
  id: string
  businessName: string
  tier: string
  trustScore: number
}

export interface AdminAuditLog {
  id: string
  ecosystemId?: string
  ecosystemName?: string
  vendorId?: string
  vendorName?: string
  action: string
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL'
  details: Record<string, unknown>
  createdAt?: string
  Vendor?: { businessName: string }
  Ecosystem?: { name: string }
}

export interface TrustScoreOverrideDto {
  vendorId: string
  newScore: number
  reason: string
}

export const useAdminEcosystems = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const ecosystems = ref<AdminEcosystem[]>([])
  const auditLogs = ref<AdminAuditLog[]>([])
  const loading = ref(false)
  const showLogs = ref(false)
  const selectedEco = ref<AdminEcosystem | null>(null)
  const showOverrideModal = ref(false)
  const targetMember = ref<AdminEcosystemMember | null>(null)
  const overrideScore = ref(100)
  const overrideReason = ref('')
  const submitting = ref(false)

  const totalPrivateStock = computed(() =>
    ecosystems.value.reduce((s, e) => s + (e.stats?.totalStok ?? 0), 0)
  )
  const totalInventoryValue = computed(() =>
    ecosystems.value.reduce((s, e) => s + (e.stats?.totalValue ?? 0), 0)
  )
  const recentViolations = computed(() =>
    auditLogs.value.filter((l: AdminAuditLog) => l.severity !== 'INFO').length
  )

  const fetchData = async (): Promise<void> => {
    loading.value = true
    try {
      const [ecoRes, logRes] = await Promise.all([
        $api<{ success: boolean; ecosystems?: AdminEcosystem[] }>('/api/v1/admin/ecosystems'),
        $api<{ success: boolean; logs?: AdminAuditLog[] }>('/api/v1/admin/ecosystems/logs'),
      ])
      ecosystems.value = ecoRes.ecosystems ?? []
      auditLogs.value = logRes.logs ?? []
      if (selectedEco.value) {
        const updated = ecosystems.value.find((e: AdminEcosystem) => e.id === selectedEco.value?.id)
        if (updated) selectedEco.value = updated
      }
    } catch {
      $toast.error('Veriler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const submitOverride = async (): Promise<void> => {
    if (submitting.value || !targetMember.value) return
    submitting.value = true
    try {
      const dto: TrustScoreOverrideDto = {
        vendorId: targetMember.value.id,
        newScore: overrideScore.value,
        reason: overrideReason.value,
      }
      await $api('/api/v1/admin/ecosystems/trust-score', {
        method: 'POST',
        body: dto,
      })
      $toast.success('TrustScore güncellendi')
      showOverrideModal.value = false
      await fetchData()
    } catch (e: unknown) {
      const errObj = e as { data?: { error?: string } }
      $toast.error(errObj?.data?.error || 'Hata oluştu')
    } finally {
      submitting.value = false
    }
  }

  const removeMember = async (vendorId: string): Promise<void> => {
    if (!confirm('Üyeyi çıkarmak istediğinize emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/ecosystems/members/${vendorId}`, { method: 'DELETE' })
      $toast.success('Üye çıkarıldı')
      await fetchData()
    } catch (e: unknown) {
      const errObj = e as { data?: { error?: string } }
      $toast.error(errObj?.data?.error || 'Hata oluştu')
    }
  }

  onMounted(fetchData)

  return {
    ecosystems,
    auditLogs,
    loading,
    showLogs,
    selectedEco,
    showOverrideModal,
    targetMember,
    overrideScore,
    overrideReason,
    submitting,
    totalPrivateStock,
    totalInventoryValue,
    recentViolations,
    fetchData,
    submitOverride,
    removeMember,
  }
}