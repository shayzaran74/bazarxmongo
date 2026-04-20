import { ref, onMounted } from 'vue'

export const useVendorSettings = () => {
  const { $api } = useApi()
  const authStore = useAuthStore()
  const { $toast } = useNuxtApp()
  
  const loading = ref(true)
  const saving = ref(false)
  const vendor = ref<any>(null)
  const vendorProducts = ref<any[]>([])
  
  const form = ref({
    businessName: '', logoUrl: '', coverImageUrl: '', description: '',
    phone: '', whatsapp: '', email: '', website: '',
    address: '', city: '', country: 'Türkiye', zipCode: '',
    bankName: '', bankAccountName: '', bankIban: '',
    adProductIdLeft: '', adProductIdRight: '',
    showAd: false, showFlashSales: false, flashProductIds: [] as string[]
  })

  const fetchProfile = async () => {
    loading.value = true
    try {
      const res: any = await $api(`/api/vendors/profile/${authStore.user?.id}`)
      if (res.success && res.data) {
        vendor.value = res.data
        Object.keys(form.value).forEach(key => {
          if (res.data[key] !== undefined) (form.value as any)[key] = res.data[key] ?? (form.value as any)[key]
        })
      }
    } catch (e) {
      $toast.error('Profil yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchVendorProducts = async () => {
    if (!vendor.value?.id) return
    try {
      const res: any = await $api(`/api/products`, { params: { vendorId: vendor.value.id, limit: 100, status: 'ACTIVE' } })
      if (res.success) vendorProducts.value = res.data || []
    } catch (e) { console.error(e) }
  }

  const handleFileUpload = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      $toast.info('Yükleniyor...')
      const res: any = await $api(`/api/upload?type=${type}`, { method: 'POST', body: formData })
      if (res.success && res.data?.url) {
        if (type === 'logo') form.value.logoUrl = res.data.url
        else if (type === 'banner') form.value.coverImageUrl = res.data.url
        $toast.success('Görsel yüklendi')
      }
    } catch (e) { $toast.error('Yükleme başarısız') }
  }

  const saveSettings = async () => {
    if (!vendor.value?.id) return
    saving.value = true
    try {
      const res: any = await $api(`/api/vendors/${vendor.value.id}`, { method: 'PUT', body: form.value })
      if (res.success) {
        $toast.success('Ayarlar kaydedildi')
        vendor.value = res.data
      }
    } catch (e) { $toast.error('Hata oluştu') }
    finally { saving.value = false }
  }

  const toggleFlashProduct = (id: string) => {
    const idx = form.value.flashProductIds.indexOf(id)
    if (idx > -1) form.value.flashProductIds.splice(idx, 1)
    else if (form.value.flashProductIds.length < 10) form.value.flashProductIds.push(id)
    else $toast.warning('Maksimum 10 ürün')
  }

  return {
    loading, saving, vendor, vendorProducts, form,
    fetchProfile, fetchVendorProducts, handleFileUpload, saveSettings, toggleFlashProduct
  }
}
