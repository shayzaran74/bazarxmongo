import { ref, computed } from 'vue'

export const useCalculators = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(value || 0)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(value || 0)
  }

  const getPlatformColor = (id: string) => {
    const colors: Record<string, string> = {
      trendyol: 'bg-orange-500',
      n11: 'bg-purple-600',
      hepsiburada: 'bg-orange-400',
      amazon: 'bg-yellow-500',
      ciceksepeti: 'bg-pink-500',
      ticaritakas: 'bg-blue-600'
    }
    return colors[id] || 'bg-gray-500'
  }

  return {
    formatCurrency,
    formatNumber,
    getPlatformColor
  }
}
