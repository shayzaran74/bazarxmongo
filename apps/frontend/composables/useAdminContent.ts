import { ref, onMounted } from 'vue'

export const useAdminContent = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  const activeTab = ref('announcements')
  const uploading = ref(false)

  // Data State
  const announcements = ref<any[]>([])
  const policies = ref<any[]>([])
  const contents = ref<any[]>([])

  // Modal State
  const showAnnouncementModal = ref(false)
  const showPolicyModal = ref(false)
  const showContentModal = ref(false)

  const editingAnnouncement = ref<any>(null)
  const editingPolicy = ref<any>(null)
  const editingContent = ref<any>(null)

  // Form State
  const announcementForm = ref({
    title: '',
    content: '',
    type: 'info',
    targetPage: 'all',
    startDate: '',
    endDate: '',
    linkUrl: '',
    linkText: '',
    isActive: true,
    priority: 0
  })

  const policyForm = ref({
    title: '',
    slug: '',
    content: '',
    type: 'privacy',
    version: '1.0',
    isActive: true
  })

  const contentForm = ref({
    key: '',
    title: '',
    content: '',
    contentType: 'text',
    category: '',
    isActive: true
  })

  // Fetch Methods
  const fetchAll = async () => {
    await Promise.all([
      fetchAnnouncements(),
      fetchPolicies(),
      fetchContents()
    ])
  }

  const fetchAnnouncements = async () => {
    const res: any = await $api('/api/dynamic/admin/announcements')
    if (res?.success) announcements.value = res.data
  }

  const fetchPolicies = async () => {
    const res: any = await $api('/api/dynamic/admin/policies')
    if (res?.success) policies.value = res.data
  }

  const fetchContents = async () => {
    const res: any = await $api('/api/dynamic/admin/contents')
    if (res?.success) contents.value = res.data
  }

  // Upload Logic
  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0]
    if (!file) return
    uploading.value = true
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res: any = await $api('/api/upload?type=announcement', {
        method: 'POST',
        body: formData
      })
      if (res.success) {
        announcementForm.value.linkUrl = res.url
        announcementForm.value.linkText = file.name
        toast.success('Dosya yüklendi')
      }
    } catch (e) {
      toast.error('Yükleme hatası')
    } finally {
      uploading.value = false
    }
  }

  // Save Logic
  const saveAnnouncement = async () => {
    const url = editingAnnouncement.value ? `/api/dynamic/admin/announcements/${editingAnnouncement.value.id}` : '/api/dynamic/admin/announcements'
    const method = editingAnnouncement.value ? 'PUT' : 'POST'
    const res: any = await $api(url, { method, body: announcementForm.value })
    if (res.success) {
      toast.success('Duyuru kaydedildi')
      showAnnouncementModal.value = false
      fetchAnnouncements()
    }
  }

  const savePolicy = async () => {
    const url = editingPolicy.value ? `/api/dynamic/admin/policies/${editingPolicy.value.id}` : '/api/dynamic/admin/policies'
    const method = editingPolicy.value ? 'PUT' : 'POST'
    const res: any = await $api(url, { method, body: policyForm.value })
    if (res.success) {
      toast.success('Politika kaydedildi')
      showPolicyModal.value = false
      fetchPolicies()
    }
  }

  const saveContent = async () => {
    const url = editingContent.value ? `/api/dynamic/admin/contents/${editingContent.value.id}` : '/api/dynamic/admin/contents'
    const method = editingContent.value ? 'PUT' : 'POST'
    const res: any = await $api(url, { method, body: contentForm.value })
    if (res.success) {
      toast.success('İçerik kaydedildi')
      showContentModal.value = false
      fetchContents()
    }
  }

  // Delete Logic
  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    const res: any = await $api(`/api/dynamic/admin/announcements/${id}`, { method: 'DELETE' })
    if (res.success) {
      toast.success('Duyuru silindi')
      fetchAnnouncements()
    }
  }

  const deletePolicy = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    const res: any = await $api(`/api/dynamic/admin/policies/${id}`, { method: 'DELETE' })
    if (res.success) {
      toast.success('Politika silindi')
      fetchPolicies()
    }
  }

  const deleteContent = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    const res: any = await $api(`/api/dynamic/admin/contents/${id}`, { method: 'DELETE' })
    if (res.success) {
      toast.success('İçerik silindi')
      fetchContents()
    }
  }

  const openAnnouncementModal = (item: any = null) => {
    editingAnnouncement.value = item
    if (item) {
      announcementForm.value = { ...item }
      if (item.startDate) announcementForm.value.startDate = new Date(item.startDate).toISOString().slice(0, 16)
      if (item.endDate) announcementForm.value.endDate = new Date(item.endDate).toISOString().slice(0, 16)
    } else {
      announcementForm.value = { title: '', content: '', type: 'info', targetPage: 'all', startDate: '', endDate: '', linkUrl: '', linkText: '', isActive: true, priority: 0 }
    }
    showAnnouncementModal.value = true
  }

  const openPolicyModal = (item: any = null) => {
    editingPolicy.value = item
    if (item) {
      policyForm.value = { ...item }
    } else {
      policyForm.value = { title: '', slug: '', content: '', type: 'privacy', version: '1.0', isActive: true }
    }
    showPolicyModal.value = true
  }

  const openContentModal = (item: any = null) => {
    editingContent.value = item
    if (item) {
      contentForm.value = { ...item }
    } else {
      contentForm.value = { key: '', title: '', content: '', contentType: 'text', category: '', isActive: true }
    }
    showContentModal.value = true
  }

  return {
    activeTab, uploading, announcements, policies, contents,
    showAnnouncementModal, showPolicyModal, showContentModal,
    editingAnnouncement, editingPolicy, editingContent,
    announcementForm, policyForm, contentForm,
    fetchAll, handleFileUpload, saveAnnouncement, savePolicy, saveContent,
    deleteAnnouncement, deletePolicy, deleteContent,
    openAnnouncementModal, openPolicyModal, openContentModal
  }
}
