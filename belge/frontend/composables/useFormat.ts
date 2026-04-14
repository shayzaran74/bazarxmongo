export const useFormat = () => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const formatTimeRemaining = (endTime: string | Date, t: (key: string) => string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const diff = end - now

    if (diff <= 0) return t('home.ended')

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}${t('home.dayAbbr')} ${hours}${t('home.hourAbbr')}`
    if (hours > 0) return `${hours}${t('home.hourAbbr')} ${minutes}${t('home.minAbbr')}`
    return `${minutes}${t('home.minAbbr')}`
  }

  const formatPriceNum = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  return {
    formatPrice,
    formatPriceNum,
    formatDate,
    formatTimeRemaining
  }
}
