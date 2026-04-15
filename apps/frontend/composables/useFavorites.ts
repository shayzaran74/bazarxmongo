export function useFavorites() {
  const { $api } = useApi()
  const favorites = ref<string[]>([])

  async function toggleFavorite(productId: string) {
    // Şimdilik geçici implementasyon (backend entegrasyonu yapılacak)
    const index = favorites.value.indexOf(productId)
    if (index === -1) {
      favorites.value.push(productId)
    } else {
      favorites.value.splice(index, 1)
    }
  }

  function isFavorite(productId: string) {
    return favorites.value.includes(productId)
  }

  return { favorites, toggleFavorite, isFavorite }
}
