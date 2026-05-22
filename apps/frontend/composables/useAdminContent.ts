import { ref } from 'vue'
import { useApi } from '#imports'

export const useAdminContent = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  // Tab State
  const activeTab = ref('announcements')
  const loading = ref(false)
  const uploading = ref(false)

  // Data Lists
  const announcements = ref<any[]>([])
  const policies = ref<any[]>([])
  const contents = ref<any[]>([])

  // Modal States
  const showAnnouncementModal = ref(false)
  const showPolicyModal = ref(false)
  const showContentModal = ref(false)

  // Editing States
  const editingAnnouncement = ref<any>(null)
  const editingPolicy = ref<any>(null)
  const editingContent = ref<any>(null)

  // Forms
  const announcementForm = ref({
    title: '',
    content: '',
    imageUrl: '',
    isActive: true,
    endDate: ''
  })

  const policyForm = ref({
    title: '',
    slug: '',
    content: '',
    isActive: true
  })

  const contentForm = ref({
    key: '',
    title: '',
    content: '',
    category: '',
    contentType: 'text',
    isActive: true
  })

  // ─── Fetching ─────────────────────────────────────────────────────────────
  
  const fetchAll = async () => {
    loading.value = true
    try {
      const [annRes, polRes, dynRes] = await Promise.all([
        $api('/api/v1/admin/content/announcements'),
        $api('/api/v1/admin/content/policies'),
        $api('/api/v1/admin/content/dynamic')
      ])
      
      announcements.value = annRes.data || []
      policies.value = polRes.data || []
      contents.value = dynRes.data || []
    } catch {
      $toast.error('İçerikler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  // ─── Modals ───────────────────────────────────────────────────────────────
  
  const openAnnouncementModal = (item?: any) => {
    editingAnnouncement.value = item || null
    announcementForm.value = item ? { ...item } : {
      title: '', content: '', imageUrl: '', isActive: true, endDate: ''
    }
    showAnnouncementModal.value = true
  }

  const openPolicyModal = (item?: any) => {
    editingPolicy.value = item || null
    policyForm.value = item ? { ...item } : {
      title: '', slug: '', content: '', isActive: true
    }
    showPolicyModal.value = true
  }

  const openContentModal = (item?: any) => {
    editingContent.value = item || null
    contentForm.value = item ? { ...item } : {
      key: '', title: '', content: '', category: '', contentType: 'text', isActive: true
    }
    showContentModal.value = true
  }

  // ─── Actions (Save/Delete) ────────────────────────────────────────────────
  
  const saveAnnouncement = async () => {
    try {
      const id = editingAnnouncement.value?.id
      const method = id ? 'PUT' : 'POST'
      const url = id ? `/api/v1/admin/content/announcements/${id}` : '/api/v1/admin/content/announcements'
      
      await $api(url, { method, body: announcementForm.value })
      $toast.success('Duyuru kaydedildi')
      showAnnouncementModal.value = false
      fetchAll()
    } catch { $toast.error('Kaydedilemedi') }
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/content/announcements/${id}`, { method: 'DELETE' })
      $toast.success('Silindi')
      fetchAll()
    } catch { $toast.error('Silinemedi') }
  }

  const savePolicy = async () => {
    try {
      const id = editingPolicy.value?.id
      const method = id ? 'PUT' : 'POST'
      const url = id ? `/api/v1/admin/content/policies/${id}` : '/api/v1/admin/content/policies'
      
      await $api(url, { method, body: policyForm.value })
      $toast.success('Politika kaydedildi')
      showPolicyModal.value = false
      fetchAll()
    } catch { $toast.error('Kaydedilemedi') }
  }

  const deletePolicy = async (id: string) => {
    if (!confirm('Emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/content/policies/${id}`, { method: 'DELETE' })
      $toast.success('Silindi')
      fetchAll()
    } catch { $toast.error('Silinemedi') }
  }

  const saveContent = async () => {
    try {
      const id = editingContent.value?.id
      const method = id ? 'PUT' : 'POST'
      const url = id ? `/api/v1/admin/content/dynamic/${id}` : '/api/v1/admin/content/dynamic'
      
      await $api(url, { method, body: contentForm.value })
      $toast.success('İçerik kaydedildi')
      showContentModal.value = false
      fetchAll()
    } catch { $toast.error('Kaydedilemedi') }
  }

  const deleteContent = async (id: string) => {
    if (!confirm('Emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/content/dynamic/${id}`, { method: 'DELETE' })
      $toast.success('Silindi')
      fetchAll()
    } catch { $toast.error('Silinemedi') }
  }

  const handleFileUpload = async (event: any) => {
    // Görsel yükleme mantığı buraya eklenebilir
    // TODO: Implement file upload
  }

  return {
    activeTab, announcements, policies, contents, loading, uploading,
    showAnnouncementModal, showPolicyModal, showContentModal,
    editingAnnouncement, editingPolicy, editingContent,
    announcementForm, policyForm, contentForm,
    fetchAll, handleFileUpload,
    saveAnnouncement, savePolicy, saveContent,
    deleteAnnouncement, deletePolicy, deleteContent,
    openAnnouncementModal, openPolicyModal, openContentModal
  }
}
