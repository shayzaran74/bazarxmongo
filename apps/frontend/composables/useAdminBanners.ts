import { ref, computed, onMounted } from 'vue'

export const useAdminBanners = (currentEcosystem: string) => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  const config = useRuntimeConfig()

  const banners = ref<any[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const uploading = ref(false)
  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const isEditing = ref(false)
  const editingBannerId = ref<string | null>(null)
  const bannerToDelete = ref<any>(null)
  const imagePreview = ref<string | null>(null)

  const defaultForm = {
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: '',
    ecosystems: ['GLOBAL'],
    position: 'home_top',
    locationTags: { city: '', district: '' }
  }

  const formData = ref({ ...defaultForm })

  const fetchBanners = async () => {
    loading.value = true
    try {
      const res: any = await $api(`/api/admin/banners?ecosystem=${currentEcosystem}`)
      if (res.success) banners.value = res.data
    } finally { loading.value = false }
  }

  const handleFileUpload = async (file: File) => {
    uploading.value = true
    imagePreview.value = URL.createObjectURL(file)
    try {
      const body = new FormData()
      body.append('file', file)
      const res: any = await $api('/api/upload?type=banner', { method: 'POST', body })
      if (res.success) formData.value.imageUrl = res.url
    } catch { 
      imagePreview.value = null 
      toast.error('Yükleme başarısız')
    } finally { uploading.value = false }
  }

  const saveBanner = async () => {
    saving.value = true
    try {
      const method = isEditing.value ? 'PUT' : 'POST'
      const url = isEditing.value ? `/api/admin/banners/${editingBannerId.value}` : '/api/admin/banners'
      const res: any = await $api(url, { method, body: formData.value })
      if (res.success) {
        toast.success(isEditing.value ? 'Güncellendi' : 'Oluşturuldu')
        showModal.value = false
        await fetchBanners()
      }
    } finally { saving.value = false }
  }

  const toggleStatus = async (banner: any) => {
    try {
      const res: any = await $api(`/api/admin/banners/${banner.id}`, { method: 'PUT', body: { isActive: !banner.isActive } })
      if (res.success) await fetchBanners()
    } catch { toast.error('Durum güncellenemedi') }
  }

  const removeBanner = async () => {
    if (!bannerToDelete.value) return
    deleting.value = true
    try {
      const res: any = await $api(`/api/admin/banners/${bannerToDelete.value.id}`, { method: 'DELETE' })
      if (res.success) {
        showDeleteModal.value = false
        await fetchBanners()
      }
    } finally { deleting.value = false }
  }

  return {
    banners, loading, saving, deleting, uploading, showModal, showDeleteModal,
    isEditing, editingBannerId, bannerToDelete, imagePreview, formData,
    fetchBanners, handleFileUpload, saveBanner, toggleStatus, removeBanner
  }
}
