// composables/useVendorDashboard.ts
// Ref dashboard (vendor1) + mevcut composable birleştirildi

export const useVendorDashboard = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()
  const authStore = useAuthStore()

  // ─── State ────────────────────────────────────────────────────────
  const loading = ref(false)

  const stats = reactive({
    totalSales: '₺0',
    orderCount: 0,
    productCount: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    averageRating: '0.0',
    commissionRate: 10,
    users: 0,
  })

  const xpStats = reactive({
    commissionXP: 0,
    adXP: 0,
    serviceXP: 0,
    barterBalance: 0,
  })

  const recentActivities = ref<any[]>([])
  const rawOrders = ref<any[]>([])
  const myEcosystem = ref<any>(null)
  const vendorTierData = ref<any>(null)
  const vendorTierStats = ref<any>(null)
  const brandStats = ref<any>(null)

  // ─── Computed ─────────────────────────────────────────────────────
  const pendingOrdersList = computed(() =>
    rawOrders.value
      .filter(o => o.status === 'PENDING' || o.status === 'PROCESSING')
      .slice(0, 5)
  )

  // ─── Helpers ──────────────────────────────────────────────────────
  const formatPrice = (value: number | string) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })
      .format(Number(value) || 0)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'Beklemede', PROCESSING: 'Hazırlanıyor',
      SHIPPED: 'Kargoda', DELIVERED: 'Teslim Edildi',
      CANCELLED: 'İptal', ACTIVE: 'Aktif',
    }
    return map[status] || status
  }

  const getStatusBadgeClass = (status: string) => {
    const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
    const map: Record<string, string> = {
      PENDING: `${base} bg-orange-100 text-orange-800`,
      PROCESSING: `${base} bg-blue-100 text-blue-800`,
      SHIPPED: `${base} bg-purple-100 text-purple-800`,
      DELIVERED: `${base} bg-green-100 text-green-800`,
      CANCELLED: `${base} bg-red-100 text-red-800`,
      ACTIVE: `${base} bg-green-100 text-green-800`,
    }
    return map[status] || `${base} bg-gray-100 text-gray-800`
  }

  const getOrderActivityTitle = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'Yeni sipariş geldi',
      PROCESSING: 'Sipariş hazırlanıyor',
      SHIPPED: 'Sipariş kargolandı',
      DELIVERED: 'Sipariş teslim edildi',
      CANCELLED: 'Sipariş iptal edildi',
    }
    return map[status] || 'Sipariş güncellemesi'
  }

  const orderTotalForVendor = (order: any): number =>
    (order.OrderItem || []).reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity, 0
    )

  // ─── Fetch Actions ────────────────────────────────────────────────
  const fetchStats = async () => {
    loading.value = true
    try {
      const [productsRes, ordersRes] = await Promise.allSettled([
        $api<any>('/api/v1/vendors/products', { query: { limit: 100 } }),
        $api<any>('/api/vendors/orders'),
      ])

      const products = productsRes.status === 'fulfilled' ? productsRes.value : null
      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value : null

      stats.productCount = products?.data?.length || 0
      // API response is { success: true, data: { items: [], total: 0 } }
      rawOrders.value = orders?.data?.items || (Array.isArray(orders?.data) ? orders.data : [])
      stats.orderCount = rawOrders.value.length
      stats.pendingOrders = rawOrders.value.filter(
        (o: any) => o.status === 'PENDING'
      ).length

      // Gerçek stats endpoint — Doğru yol: /api/vendors/inventory/stats
      try {
        const statsRes = await $api<any>('/api/vendors/inventory/stats')
        if (statsRes.success) {
          // stats.totalSales frontend'de '₺' formatında bekleniyor
          stats.totalSales = formatPrice(statsRes.data.totalRevenue || 0)
          stats.productCount = statsRes.data.totalProducts || stats.productCount
          stats.pendingOrders = statsRes.data.pendingOrders ?? stats.pendingOrders
          // Diğer alanları mevcut stats objesine uyduruyoruz
          stats.averageRating = statsRes.data.averageRating || '0.0'
          stats.commissionRate = statsRes.data.commissionRate || 10
        }
      } catch (e) { 
        console.warn('Dashboard stats fetch failed, using fallback:', e)
      }

      // Son aktiviteler
      const pActivities = (products?.data || []).slice(0, 3).map((p: any) => ({
        id: `product-${p.id}`,
        title: p.isActive ? 'Ürün yayında' : 'Ürün beklemede',
        description: p.name,
        status: p.isActive ? 'Aktif' : 'Pasif',
        statusRaw: p.isActive ? 'ACTIVE' : 'PENDING',
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }))

      const oActivities = rawOrders.value.slice(0, 3).map((o: any) => ({
        id: `order-${o.id}`,
        title: getOrderActivityTitle(o.status),
        description: `#${o.orderNumber} nolu siparişte ürünleriniz var`,
        status: getStatusText(o.status),
        statusRaw: o.status,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }))

      recentActivities.value = [...pActivities, ...oActivities]
        .sort((a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        )
        .slice(0, 5)

    } catch (e: unknown) {
      console.error('fetchStats error:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchXPStats = async () => {
    try {
      const res = await $api<any>('/api/wallet')
      if (res.success && res.data?.accounts) {
        // Yeni birleşik yapıda hesapları bul
        const accounts = res.data.accounts
        const main = accounts.find((a: any) => a.type === 'MAIN')
        const barter = accounts.find((a: any) => a.type === 'BARTER')
        const xpAds = accounts.find((a: any) => a.type === 'XP_ADS')
        const xpComm = accounts.find((a: any) => a.type === 'XP_COMMISSION')
        
        xpStats.commissionXP = Number(xpComm?.availableBalance || 0)
        xpStats.adXP = Number(xpAds?.availableBalance || 0)
        xpStats.serviceXP = 0 // Veya ilgili hesap tipi
        xpStats.barterBalance = Number(barter?.availableBalance || 0)
      } else if (res.success) {
        // Fallback
        xpStats.commissionXP = res.data?.commissionXP || 0
        xpStats.adXP = res.data?.adXP || 0
        xpStats.serviceXP = res.data?.serviceXP || 0
        xpStats.barterBalance = res.data?.barterBalance || 0
      }
    } catch { /* ignore */ }
  }

  const fetchVendorTier = async () => {
    try {
      // /api/tiers/vendor mevcut değilse fallback
      // const res = await $api<any>('/api/tiers/vendor')
      vendorTierData.value = { name: 'Core Satıcı', level: 1 } 
      vendorTierStats.value = {
        totalSales: stats.orderCount,
        totalRevenue: parseFloat(
          String(stats.totalSales).replace(/[^0-9.-]+/g, '')
        ) || 0,
        averageRating: parseFloat(stats.averageRating) || 0,
        productCount: stats.productCount,
      }
    } catch { /* ignore */ }
  }

  const fetchBrandStats = async () => {
    try {
      // brand-stats yerine vendor-brands listesinden hesaplıyoruz
      const res = await $api<any>('/api/vendor-brands')
      if (res.success && Array.isArray(res.data)) {
        brandStats.value = {
          total: res.data.length,
          approved: res.data.filter((b: any) => b.status === 'APPROVED').length,
          pending: res.data.filter((b: any) => b.status === 'PENDING').length,
          rejected: res.data.filter((b: any) => b.status === 'REJECTED').length,
        }
      }
    } catch { /* ignore */ }
  }

  const fetchEcosystemStatus = async () => {
    try {
      const res: any = await $api('/api/v1/ecosystem/my')
      if (res.success && res.ecosystem) {
        myEcosystem.value = res.ecosystem
      }
    } catch { /* ignore */ }
  }

  const createDefaultEcosystem = async () => {
    if (!confirm('Henüz bir Ekosisteminiz bulunmuyor. Şirket isminizle bir tane oluşturulsun mu?')) return
    try {
      const res = await $api<any>('/api/ecosystem/create', {
        method: 'POST',
        body: {
          name: authStore.user?.vendor?.businessName || 'Marka Ekosistemim',
          description: 'Bayilerimiz için özel ürün ve kampanya kataloğudur.',
        },
      })
      if (res.success) {
        myEcosystem.value = res.data
        $toast.success('Ekosisteminiz başarıyla oluşturuldu!')
        navigateTo(`/ecosystem/${res.data.id}`)
      }
    } catch (e: any) {
      $toast.error('Ekosistem oluşturulamadı: ' + (e?.data?.error || 'Bilinmeyen hata'))
    }
  }

  const handleBarterDeposit = async () => {
    const amountStr = prompt('Barter havuzuna aktarmak istediğiniz nakit miktarı giriniz (₺):')
    if (!amountStr) return
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) { $toast.error('Geçerli bir miktar giriniz.'); return }
    try {
      const res = await $api<any>('/api/barter/topup', { method: 'POST', body: { amount } })
      if (res.success) { $toast.success('Bakiye başarıyla barter havuzuna aktarıldı.'); await fetchXPStats() }
    } catch (e: any) { $toast.error(e?.data?.error || 'Aktarım başarısız oldu.') }
  }

  const handleBarterWithdraw = async () => {
    const amountStr = prompt('Barter havuzundan nakit cüzdanınıza çekmek istediğiniz miktarı giriniz (₺):')
    if (!amountStr) return
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) { $toast.error('Geçerli bir miktar giriniz.'); return }
    try {
      const res = await $api<any>('/api/barter/withdraw', { method: 'POST', body: { amount } })
      if (res.success) { $toast.success('Bakiye başarıyla nakit cüzdanınıza çekildi.'); await fetchXPStats() }
    } catch (e: any) { $toast.error(e?.data?.error || 'Çekim işlemi başarısız oldu.') }
  }

  return {
    // State
    loading, stats, xpStats,
    recentActivities, rawOrders, pendingOrdersList,
    myEcosystem, vendorTierData, vendorTierStats, brandStats,
    // Helpers
    formatPrice, formatDate,
    getStatusText, getStatusBadgeClass, orderTotalForVendor,
    // Actions
    fetchStats, fetchXPStats, fetchVendorTier,
    fetchBrandStats, fetchEcosystemStatus,
    createDefaultEcosystem, handleBarterDeposit, handleBarterWithdraw,
    // Auth
    authStore,
  }
}
