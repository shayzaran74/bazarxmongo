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

  const orderTotalForVendor = (order: Record<string, unknown>): number =>
    ((order.OrderItem as Array<{ price: string | number; quantity: string | number }>) || []).reduce(
      (sum: number, item) => sum + Number(item.price) * Number(item.quantity), 0
    )

  // ─── Fetch Actions ────────────────────────────────────────────────
  const fetchStats = async () => {
    loading.value = true
    try {
      const [productsRes, ordersRes] = await Promise.allSettled([
        $api<{ data?: Record<string, unknown>[] }>('/api/v1/vendors/products', { query: { limit: 100 } }),
        $api<{ data?: { items: Record<string, unknown>[] } | Record<string, unknown>[] }>('/api/v1/vendors/orders'),
      ])

      const products = productsRes.status === 'fulfilled' ? productsRes.value : null
      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value : null

      stats.productCount = (products?.data as Record<string, unknown>[])?.length || 0
      // API response is { success: true, data: { items: [], total: 0 } }
      const ordersData = orders?.data
      rawOrders.value = (ordersData as { items?: Record<string, unknown>[] })?.items || (Array.isArray(ordersData) ? ordersData : [])
      stats.orderCount = rawOrders.value.length
      stats.pendingOrders = rawOrders.value.filter(
        (o) => o.status === 'PENDING'
      ).length

      // Gerçek stats endpoint — Doğru yol: /api/vendors/inventory/stats
      try {
        const statsRes = await $api<{ success: boolean; data: Record<string, unknown> }>('/api/v1/vendors/inventory/stats')
        if (statsRes.success) {
          // stats.totalSales frontend'de '₺' formatında bekleniyor
          stats.totalSales = formatPrice(statsRes.data.totalRevenue as number || 0)
          stats.productCount = statsRes.data.totalProducts as number || stats.productCount
          stats.pendingOrders = statsRes.data.pendingOrders as number ?? stats.pendingOrders
          // Diğer alanları mevcut stats objesine uyduruyoruz
          stats.averageRating = String(statsRes.data.averageRating || '0.0')
          stats.commissionRate = statsRes.data.commissionRate as number || 10
        }
      } catch {
        /* istatistik alınamadı, fallback kullanılıyor */
      }

      // Son aktiviteler
      const pActivities = ((products?.data as Record<string, unknown>[]) || []).slice(0, 3).map((p: Record<string, unknown>) => ({
        id: `product-${p.id}`,
        title: p.isActive ? 'Ürün yayında' : 'Ürün beklemede',
        description: p.name as string,
        status: p.isActive ? 'Aktif' : 'Pasif',
        statusRaw: p.isActive ? 'ACTIVE' : 'PENDING',
        createdAt: p.createdAt as string,
        updatedAt: p.updatedAt as string,
      }))

      const oActivities = rawOrders.value.slice(0, 3).map((o: Record<string, unknown>) => ({
        id: `order-${o.id}`,
        title: getOrderActivityTitle(o.status as string),
        description: `#${o.orderNumber} nolu siparişte ürünleriniz var`,
        status: getStatusText(o.status as string),
        statusRaw: o.status,
        createdAt: o.createdAt as string,
        updatedAt: o.updatedAt as string,
      }))

      recentActivities.value = [...pActivities, ...oActivities]
        .sort((a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        )
        .slice(0, 5)

    } catch {
      /* sessiz hata */
    } finally {
      loading.value = false
    }
  }

  const fetchXPStats = async () => {
    try {
      const res = await $api<{ success: boolean; data: { accounts?: Array<{ type: string; availableBalance?: string | number }> } }>('/api/v1/wallet')
      if (res.success && res.data?.accounts) {
        // Yeni birleşik yapıda hesapları bul
        const accounts = res.data.accounts
        const main = accounts.find((a) => a.type === 'MAIN')
        const barter = accounts.find((a) => a.type === 'BARTER')
        const xpAds = accounts.find((a) => a.type === 'XP_ADS')
        const xpComm = accounts.find((a) => a.type === 'XP_COMMISSION')

        xpStats.commissionXP = Number(xpComm?.availableBalance || 0)
        xpStats.adXP = Number(xpAds?.availableBalance || 0)
        xpStats.serviceXP = 0 // Veya ilgili hesap tipi
        xpStats.barterBalance = Number(barter?.availableBalance || 0)
      } else if (res.success) {
        // Fallback
        xpStats.commissionXP = 0
        xpStats.adXP = 0
        xpStats.serviceXP = 0
        xpStats.barterBalance = 0
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
      const res = await $api<{ success: boolean; data: Array<{ status: string }> }>('/api/v1/vendor-brands')
      if (res.success && Array.isArray(res.data)) {
        brandStats.value = {
          total: res.data.length,
          approved: res.data.filter((b) => b.status === 'APPROVED').length,
          pending: res.data.filter((b) => b.status === 'PENDING').length,
          rejected: res.data.filter((b) => b.status === 'REJECTED').length,
        }
      }
    } catch { /* ignore */ }
  }

  const fetchEcosystemStatus = async () => {
    try {
      const res = await $api<{ success: boolean; ecosystem?: Record<string, unknown> }>('/api/v1/ecosystem/my')
      if (res.success && res.ecosystem) {
        myEcosystem.value = res.ecosystem
      }
    } catch { /* ignore */ }
  }

  const createDefaultEcosystem = async () => {
    try {
      const res = await $api<{ success: boolean; data: Record<string, unknown> }>('/api/v1/ecosystem/create', {
        method: 'POST',
        body: {
          name: (authStore.user?.vendor as { businessName?: string })?.businessName || 'Marka Ekosistemim',
          description: 'Bayilerimiz için özel ürün ve kampanya kataloğudur.',
        },
      })
      if (res.success) {
        myEcosystem.value = res.data
        $toast.success('Ekosisteminiz başarıyla oluşturuldu!')
        navigateTo(`/ecosystem/${res.data.id}`)
      }
    } catch (e: unknown) {
      $toast.error('Ekosistem oluşturulamadı: ' + (e as { data?: { error?: string } })?.data?.error || 'Bilinmeyen hata')
    }
  }

  const handleBarterDeposit = async () => {
    const amountStr = prompt('Barter havuzuna aktarmak istediğiniz nakit miktarı giriniz (₺):')
    if (!amountStr) return
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) { $toast.error('Geçerli bir miktar giriniz.'); return }
    try {
      const res = await $api<{ success: boolean }>('/api/v1/barter/topup', { method: 'POST', body: { amount } })
      if (res.success) { $toast.success('Bakiye başarıyla barter havuzuna aktarıldı.'); await fetchXPStats() }
    } catch (e: unknown) { $toast.error((e as { data?: { error?: string } })?.data?.error || 'Aktarım başarısız oldu.') }
  }

  const handleBarterWithdraw = async () => {
    const amountStr = prompt('Barter havuzundan nakit cüzdanınıza çekmek istediğiniz miktarı giriniz (₺):')
    if (!amountStr) return
    const amount = parseFloat(amountStr)
    if (isNaN(amount) || amount <= 0) { $toast.error('Geçerli bir miktar giriniz.'); return }
    try {
      const res = await $api<{ success: boolean }>('/api/v1/barter/withdraw', { method: 'POST', body: { amount } })
      if (res.success) { $toast.success('Bakiye başarıyla nakit cüzdanınıza çekildi.'); await fetchXPStats() }
    } catch (e: unknown) { $toast.error((e as { data?: { error?: string } })?.data?.error || 'Çekim işlemi başarısız oldu.') }
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
