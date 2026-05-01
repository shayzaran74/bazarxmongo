import { ref, reactive, computed } from 'vue'
import { cities as cityList, districts as districtMap } from '@/data/turkey_locations'

export const useAdminBanners = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const banners = ref<any[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const uploading = ref(false)
  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const isEditing = ref(false)
  const imagePreview = ref<string | null>(null)

  const formData = reactive({
    id: '',
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    order: 0,
    isActive: true,
    position: 'home_top',
    startDate: '',
    endDate: '',
    locationTags: {
      city: '',
      district: ''
    }
  })

  const districtList = computed(() => {
    if (!formData.locationTags.city) return []
    return (districtMap as any)[formData.locationTags.city] || []
  })

  // Backend'den gelen veriyi frontend formatına dönüştürür
  const mapBannerData = (banner: any) => ({
    ...banner,
    imageUrl: banner.image,
    linkUrl: banner.link,
    position: banner.tag || (banner.platform === 'BAZARX' ? 'home_top' : 'home_middle'),
    startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
    endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
  })

  const fetchBanners = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/admin/banners')
      banners.value = (res.data || []).map(mapBannerData)
    } catch {
      $toast.error('Bannerlar yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const openCreateModal = () => {
    isEditing.value = false
    imagePreview.value = null
    Object.assign(formData, {
      id: '',
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      order: 0,
      isActive: true,
      position: 'home_top',
      startDate: '',
      endDate: '',
      locationTags: {
        city: '',
        district: ''
      }
    })
    showModal.value = true
  }

  const editBanner = (banner: any) => {
    isEditing.value = true
    const mapped = mapBannerData(banner)
    imagePreview.value = mapped.imageUrl
    Object.assign(formData, mapped)
    showModal.value = true
  }

  const handleUpload = async (file: File) => {
    if (!file) return
    uploading.value = true

    // Adım 1: Yükleme bitmeden anlık yerel önizleme göster
    const localPreview = URL.createObjectURL(file)
    imagePreview.value = localPreview

    try {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const token = authStore.token || useCookie('access_token').value

      const body = new FormData()
      body.append('file', file)

      // Nuxt Nitro proxy multipart/form-data isteklerini bozuyor.
      // /api/v1 yoktu — /api/upload kullanılmalı.
      // Üretim ortamında karmaşık birleştirmeler yerine doğrudan /api üzerinden gidiyoruz
      const uploadUrl = '/api/v1/upload?subPath=banners'
      
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || `Upload başarısız: ${res.status}`)
      }

      const json = await res.json()
      const url = json?.data?.url
      if (url) {
        formData.imageUrl = url
        // Adım 2: Gerçek URL'e geç, yerel blob'u serbest bırak
        URL.revokeObjectURL(localPreview)
        imagePreview.value = url
        $toast.success('Görsel yüklendi')
      } else {
        throw new Error('Sunucu URL döndürmedi')
      }
    } catch (e: any) {
      // Hata durumunda önizleme yerel dosyadan devam eder
      $toast.error(e?.message || 'Görsel yüklenemedi')
    } finally {
      uploading.value = false
    }
  }

  const saveBanner = async () => {
    if (saving.value) return
    saving.value = true
    
    try {
      const payload = {
        ...formData,
        image: formData.imageUrl,
        link: formData.linkUrl,
        platform: 'BAZARX', // Ensure platform is BAZARX for homepage
        tag: formData.position, // Save position into tag field
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      }

      if (isEditing.value) {
        await $api(`/api/admin/banners/${formData.id}`, {
          method: 'PUT',
          body: payload
        })
      } else {
        await $api('/api/admin/banners', {
          method: 'POST',
          body: payload
        })
      }

      $toast.success('Banner başarıyla kaydedildi')
      showModal.value = false
      fetchBanners()
    } catch (err: any) {
      $toast.error(err.data?.message || 'Banner kaydedilemedi')
    } finally {
      saving.value = false
    }
  }

  const deleteBanner = async (id: string) => {
    if (deleting.value) return
    deleting.value = true
    try {
      await $api(`/api/admin/banners/${id}`, { method: 'DELETE' })
      $toast.success('Banner silindi')
      showDeleteModal.value = false
      fetchBanners()
    } catch {
      $toast.error('Banner silinemedi')
    } finally {
      deleting.value = false
    }
  }

  const toggleStatus = async (banner: any) => {
    try {
      await $api(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        body: { isActive: !banner.isActive }
      })
      $toast.success('Banner durumu güncellendi')
      fetchBanners()
    } catch {
      $toast.error('Durum güncellenemedi')
    }
  }

  return {
    banners, loading, saving, deleting, uploading,
    showModal, showDeleteModal, isEditing, formData,
    imagePreview, cityList, districtList,
    fetchBanners, saveBanner, deleteBanner, toggleStatus, handleUpload,
    openCreateModal, editBanner
  }
}
