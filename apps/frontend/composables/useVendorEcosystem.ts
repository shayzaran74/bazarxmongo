export const useVendorEcosystem = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const ecosystem = ref<Record<string, unknown> | null>(null)
  const members = ref<Record<string, unknown>[]>([])
  const auditLogs = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const isOwner = ref(false)
  // Master Plan v4.3 §4.1 — Ekosistem kurabilmek için APEX zorunlu.
  // Vendor profile API'den canlı tier okunur; default false (en güvenli).
  const vendorTier = ref<string | null>(null)
  const isApexPlus = computed(() => vendorTier.value === 'APEX')
  const error = ref<string | null>(null)
  const showInviteModal = ref(false)

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      const [ecoRes, auditRes, profileRes] = await Promise.allSettled([
        $api<{ success: boolean; ecosystem?: Record<string, unknown>; isOwner?: boolean }>('/api/v1/ecosystem/my'),
        $api<{ success: boolean; data?: Record<string, unknown>[] }>('/api/v1/ecosystem/audit'),
        $api<{ data?: { tier?: string }; tier?: string }>('/api/v1/vendors/me'),
      ])

      if (ecoRes.status === 'fulfilled' && ecoRes.value?.success) {
        ecosystem.value = ecoRes.value.ecosystem
        isOwner.value = ecoRes.value.isOwner
        members.value = (ecosystem.value?.members as Record<string, unknown>[]) || []
      }

      if (auditRes.status === 'fulfilled' && auditRes.value?.success) {
        auditLogs.value = auditRes.value.data || []
      }

      // Vendor tier'ı çek (APEX kontrolü için)
      if (profileRes.status === 'fulfilled') {
        vendorTier.value = profileRes.value?.data?.tier ?? profileRes.value?.tier ?? null
      }
    } catch (e: unknown) {
      error.value = 'Ekosistem verileri alınamadı'
    } finally {
      loading.value = false
    }
  }

  const inviteMember = async (memberVendorId: string) => {
    try {
      await $api('/api/v1/ecosystem/members', {
        method: 'POST',
        body: { memberVendorId }
      })
      $toast.success('Üye davet edildi')
      showInviteModal.value = false
      await fetchData()
    } catch {
      $toast.error('Davet gönderilemedi')
    }
  }

  const createEcosystem = async (name: string, description?: string) => {
    creating.value = true
    try {
      const res = await $api<{ success: boolean }>('/api/v1/ecosystem/create', {
        method: 'POST',
        body: { name, description }
      })
      if (res.success) {
        $toast.success('Ekosistem oluşturuldu')
        await fetchData()
        return true
      }
      return false
    } catch (e: unknown) {
      // Master Plan §4.1 — APEX olmayan vendor ekosistem kuramaz
      const errObj = e as { data?: { code?: string; message?: string } }
      const code = errObj?.data?.code
      if (code === 'ECOSYSTEM_REQUIRES_APEX') {
        $toast.error('Ekosistem kurabilmek için APEX B2B üyeliği gereklidir.')
      } else {
        $toast.error(errObj?.data?.message || 'Oluşturulamadı')
      }
      return false
    } finally {
      creating.value = false
    }
  }

  const removeMember = async (memberId: string) => {
    try {
      await $api(`/api/v1/ecosystem/members/${memberId}`, { method: 'DELETE' })
      $toast.success('Üye çıkarıldı')
      await fetchData()
    } catch {
      $toast.error('Üye çıkarılamadı')
    }
  }

  return {
    ecosystem, members, auditLogs, loading, creating, isOwner, isApexPlus, vendorTier,
    error, showInviteModal, fetchData, inviteMember, createEcosystem, removeMember
  }
}
