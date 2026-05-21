// composables/useVendorSettings.ts
// Vendor dashboard ayarlar sayfası — profil yükleme, kayıt, ürün listesi

export const useVendorSettings = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const loading        = ref(true)
  const saving         = ref(false)
  const vendor         = ref<Record<string, unknown> | null>(null)
  const vendorProducts = ref<Record<string, unknown>[]>([])

  // Form alanları — backend VendorProfile alanlarıyla eşleşiyor
  const form = ref({
    // Mağaza kimliği
    storeName:       '',
    description:     '',
    logo:            '',
    banner:          '',
    // İletişim
    supportEmail:    '',
    phone:           '',
    whatsapp:        '',
    website:         '',
    // Adres
    address:         '',
    city:            '',
    district:        '',
    country:         'Türkiye',
    zipCode:         '',
    // Banka bilgileri
    bankName:        '',
    bankAccountName: '',
    bankIban:        '',
    // Vitrin & Reklam
    adProductIdLeft:  '',
    adProductIdRight: '',
    showAd:           false,
    showFlashSales:   false,
    flashProductIds:  [] as string[],
    // Restoran'a özel
    openingHours: {
      Pazartesi:  { open: '09:00', close: '22:00' },
      Salı:       { open: '09:00', close: '22:00' },
      Çarşamba:   { open: '09:00', close: '22:00' },
      Perşembe:   { open: '09:00', close: '22:00' },
      Cuma:       { open: '09:00', close: '22:00' },
      Cumartesi:  { open: '09:00', close: '22:00' },
      Pazar:      { open: '09:00', close: '22:00' },
    } as Record<string, { open: string; close: string }>,
    cuisineType:     '',
    deliveryRadius:  5,
    minOrderAmount:  0,
    avgDeliveryTime: 30,
    acceptingOrders: true,
    holidayMode:     false,
    holidayMessage:  '',
  })

  // Profil yükle — GET /api/v1/vendors/profile/me
  const fetchProfile = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: Record<string, unknown> }>('/api/v1/vendors/profile/me')
      if (res.success && res.data) {
        vendor.value = res.data
        // Gelen verileri form'a doldur (sadece tanımlı alanlar)
        const d = res.data
        const f = form.value as Record<string, unknown>
        Object.keys(f).forEach(key => {
          if (d[key] !== undefined && d[key] !== null) {
            f[key] = d[key]
          }
        })
      }
    } catch {
      $toast.error('Profil yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  // Ürün listesi — GET /api/v1/listings/marketplace?vendorId=...
  const fetchVendorProducts = async (): Promise<void> => {
    const vendorId = vendor.value?.id as string | undefined
    if (!vendorId) return
    try {
      const res = await $api<{ success: boolean; data: { items: Record<string, unknown>[] } }>(
        '/api/v1/listings/marketplace',
        { query: { vendorId, limit: 100, isActive: 'true' } }
      )
      vendorProducts.value = res?.data?.items ?? []
    } catch { /* sessizce geç */ }
  }

  // Dosya yükle
  const handleFileUpload = async (file: File, type: 'logo' | 'banner'): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      $toast.info('Yükleniyor...')
      const res = await $api<{ success: boolean; data: { url: string } }>(
        `/api/v1/upload?type=${type}`,
        { method: 'POST', body: formData }
      )
      if (res.success && res.data?.url) {
        if (type === 'logo')   form.value.logo   = res.data.url
        if (type === 'banner') form.value.banner = res.data.url
        $toast.success('Görsel yüklendi')
      }
    } catch {
      $toast.error('Yükleme başarısız')
    }
  }

  // Ayarları kaydet — PATCH /api/v1/vendors/profile/me
  const saveSettings = async (): Promise<void> => {
    saving.value = true
    try {
      const res = await $api<{ success: boolean; data: Record<string, unknown> }>(
        '/api/v1/vendors/profile/me',
        { method: 'PATCH', body: form.value }
      )
      if (res.success) {
        vendor.value = res.data
        $toast.success('Ayarlar kaydedildi')
      }
    } catch {
      $toast.error('Kayıt başarısız')
    } finally {
      saving.value = false
    }
  }

  // Flash ürün toggle
  const toggleFlashProduct = (id: string): void => {
    const idx = form.value.flashProductIds.indexOf(id)
    if (idx > -1) {
      form.value.flashProductIds.splice(idx, 1)
    } else if (form.value.flashProductIds.length < 10) {
      form.value.flashProductIds.push(id)
    } else {
      $toast.warning('Maksimum 10 ürün seçilebilir')
    }
  }

  return {
    loading, saving, vendor, vendorProducts, form,
    fetchProfile, fetchVendorProducts, handleFileUpload, saveSettings, toggleFlashProduct,
  }
}
