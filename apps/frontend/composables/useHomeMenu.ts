export const useHomeMenuItems = () => {
  return [
    { title: 'Market', icon: 'ShoppingBagIcon', path: '/products', colorFrom: 'from-orange-500', colorTo: 'to-orange-600', shadowColor: 'shadow-orange-200', hoverColor: 'hover:text-orange-600' },
    { title: 'Ticari Takas', icon: 'BuildingOffice2Icon', path: '/ticaritakas', colorFrom: 'from-blue-500', colorTo: 'to-blue-600', shadowColor: 'shadow-blue-200', hoverColor: 'hover:text-blue-600' },
    { title: 'Firma Başvurusu', icon: 'ClipboardDocumentCheckIcon', path: '/become-vendor', colorFrom: 'from-indigo-500', colorTo: 'to-indigo-600', shadowColor: 'shadow-indigo-200', hoverColor: 'hover:text-indigo-600' },
    { title: 'Takas Havuzu', icon: 'ArrowsRightLeftIcon', path: '/barter', colorFrom: 'from-teal-500', colorTo: 'to-teal-600', shadowColor: 'shadow-teal-200', hoverColor: 'hover:text-teal-600' },
    { title: 'Açık Artırma', icon: 'RectangleGroupIcon', path: '/auctions', colorFrom: 'from-purple-500', colorTo: 'to-purple-600', shadowColor: 'shadow-purple-200', hoverColor: 'hover:text-purple-600' },
    { title: 'Çekiliş', icon: 'TicketIcon', path: '/lotteries', colorFrom: 'from-red-500', colorTo: 'to-red-600', shadowColor: 'shadow-red-200', hoverColor: 'hover:text-red-600' },
    { title: 'Grup Alımı', icon: 'UsersIcon', path: '/group-buys', colorFrom: 'from-pink-500', colorTo: 'to-pink-600', shadowColor: 'shadow-pink-200', hoverColor: 'hover:text-pink-600' },
    { title: 'Fırsatlar', icon: 'StarIcon', path: '/campaigns', colorFrom: 'from-yellow-500', colorTo: 'to-yellow-600', shadowColor: 'shadow-yellow-200', hoverColor: 'hover:text-yellow-600' },
    { title: 'BazarX Go', icon: 'TruckIcon', path: '/bazarx-go', colorFrom: 'from-emerald-500', colorTo: 'to-emerald-600', shadowColor: 'shadow-emerald-200', hoverColor: 'hover:text-emerald-600' },
  ]
}

export const useHomeMenu = () => {
  const { $api } = useApi()
  const categories = ref<Record<string, unknown>[]>([])
  const loading = ref(false)

  const fetchCategories = async () => {
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: Record<string, unknown>[] }>('/api/v1/listings/categories')
      if (res.success) {
        categories.value = res.data || []
      } else {
        categories.value = []
      }
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  return {
    categories, loading, fetchCategories,
  }
}
