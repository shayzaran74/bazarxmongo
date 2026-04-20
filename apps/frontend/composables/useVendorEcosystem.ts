import { ref, computed } from 'vue'

export const useVendorEcosystem = () => {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const toast = useNuxtApp().$toast

  const loading = ref(true)
  const ecosystem = ref<any>(null)
  const isOwner = ref(false)
  const auditLogs = ref<any[]>([])
  const error = ref<string | null>(null)
  const creating = ref(false)

  const isApexPlus = computed(() => authStore.isApexPlus)

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      const res: any = await $api('/api/ecosystem/my')
      if (res.success) {
        ecosystem.value = res.ecosystem
        isOwner.value = res.isOwner
        if (isOwner.value && ecosystem.value) await fetchAuditLogs()
      }
    } catch (e: any) {
      error.value = e.data?.error || 'Veriler alınırken hata oluştu'
    } finally { loading.value = false }
  }

  const fetchAuditLogs = async () => {
    try {
      const res: any = await $api('/api/ecosystem/audit')
      if (res.success) auditLogs.value = res.data
    } catch (e) { console.error('Audit logs error:', e) }
  }

  const createEcosystem = async (name: string, description: string) => {
    creating.value = true
    try {
      const res: any = await $api('/api/ecosystem/create', { method: 'POST', body: { name, description } })
      if (res.success) {
        toast.success('Ekosistem oluşturuldu!')
        await fetchData()
        return true
      }
    } catch (e: any) { toast.error(e.data?.error || 'Hata') }
    finally { creating.value = false }
    return false
  }

  const removeMember = async (vendorId: string) => {
    if (!confirm('Bayiyi çıkarmak istediğinize emin misiniz?')) return
    try {
      const res: any = await $api(`/api/ecosystem/members/${vendorId}`, { method: 'DELETE' })
      if (res.success) {
        toast.success('Üyelik sonlandırıldı')
        await fetchData()
      }
    } catch { toast.error('Hata oluştu') }
  }

  return {
    loading, ecosystem, isOwner, auditLogs, error, creating, isApexPlus,
    fetchData, createEcosystem, removeMember
  }
}
