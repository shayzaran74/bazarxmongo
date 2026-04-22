export const useVendorEcosystem = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const ecosystem = ref<any>(null)
  const members = ref<any[]>([])
  const auditLogs = ref<any[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const isOwner = ref(false)
  const isApexPlus = ref(true) // Mocked for now
  const error = ref<string | null>(null)
  const showInviteModal = ref(false)

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      const [ecoRes, auditRes] = await Promise.allSettled([
        $api<any>('/api/ecosystem/my'),
        $api<any>('/api/ecosystem/audit')
      ])

      const ecoResAny = ecoRes as any
      const auditResAny = auditRes as any

      if (ecoRes.status === 'fulfilled' && ecoResAny.value?.success) {
        ecosystem.value = ecoResAny.value.ecosystem
        isOwner.value = ecoResAny.value.isOwner
        members.value = ecosystem.value?.members || []
      }
      
      if (auditRes.status === 'fulfilled' && auditResAny.value?.success) {
        auditLogs.value = auditResAny.value.data || auditResAny.value || []
      }
    } catch (e: any) {
      error.value = 'Ekosistem verileri alınamadı'
    } finally {
      loading.value = false
    }
  }

  const inviteMember = async (memberVendorId: string) => {
    try {
      await $api('/api/ecosystem/members', {
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
      const res = await $api<any>('/api/ecosystem/create', {
        method: 'POST',
        body: { name, description }
      })
      if (res.success) {
        $toast.success('Ekosistem oluşturuldu')
        await fetchData()
        return true
      }
      return false
    } catch {
      $toast.error('Oluşturulamadı')
      return false
    } finally {
      creating.value = false
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Bu üyeyi ekosistemden çıkarmak istediğinize emin misiniz?')) return
    try {
      await $api(`/api/ecosystem/members/${memberId}`, { method: 'DELETE' })
      $toast.success('Üye çıkarıldı')
      await fetchData()
    } catch {
      $toast.error('Üye çıkarılamadı')
    }
  }

  return {
    ecosystem, members, auditLogs, loading, creating, isOwner, isApexPlus, 
    error, showInviteModal, fetchData, inviteMember, createEcosystem, removeMember
  }
}
