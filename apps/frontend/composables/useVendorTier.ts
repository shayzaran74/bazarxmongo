import { computed } from 'vue'

export const useVendorTier = (props: any) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const tierFeatures = computed(() => {
    return props.tierData?.features || props.tierData?.benefits || []
  })

  const commissionDisplay = computed(() => {
    const data = props.tierData
    if (typeof data?.commissionRate === 'object') {
      return {
        multi: true,
        cash: (data.commissionRate.cash * 100).toFixed(0),
        barter: (data.commissionRate.barter * 100).toFixed(0)
      }
    }
    return {
      multi: false,
      rate: data?.commissionRate || props.currentCommissionRate
    }
  })

  return {
    formatCurrency,
    tierFeatures,
    commissionDisplay
  }
}
