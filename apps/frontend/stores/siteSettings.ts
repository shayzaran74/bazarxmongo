import { defineStore } from 'pinia'
import { useApi } from '~/services/api'

interface SiteSettings {
  siteName: string
  siteLogo: string
  siteLogoUrl: string | null
  siteTitle: string
  siteDescription: string
  settings: Record<string, unknown>
  homepageSettings: Record<string, string>
  ecosystemName: string
  ecosystemLogo: string
  ecosystemLogoUrl: string | null
  ecosystemSubtitle: string
  currentEcosystem: string
}

export const useSiteSettingsStore = defineStore('siteSettings', {
  state: (): SiteSettings => ({
    siteName: 'TicariTakas',
    siteLogo: '',
    siteLogoUrl: null,
    siteTitle: 'BarterBorsa - Akıllı Takas ve Alışveriş Platformu',
    siteDescription: 'Türkiye\'nin en kapsamlı barter ve alışveriş ekosistemi.',
    settings: {},
    homepageSettings: {
      showHomeSlider: 'true',
      showPersonalized: 'true',
      showQuadCards: 'true',
      showGroupBuy: 'true',
      showSpecialOffers: 'true',
      showFlashSales: 'true',
      showBarterPool: 'true',
      showPersonalizedProducts: 'true',
      showPerformance: 'true',
      showAuctions: 'true',
      showLotteries: 'true',
      showVendors: 'true',
      showRestaurants: 'true',
      showBrands: 'true',
      showNewsletter: 'true'
    },
    ecosystemName: 'TicariTakas',
    ecosystemLogo: '',
    ecosystemLogoUrl: null,
    ecosystemSubtitle: 'Ticari Takas Platformu',
    currentEcosystem: 'ticaritakas'
  }),

  actions: {
    async fetchSettings() {
      try {
        const { $api } = useApi()
        const response = await $api('/api/settings?ecosystem=bazarx') as { success: boolean, data: Record<string, unknown> }

        if (response.success && response.data) {
          const s = response.data
          this.settings = s
          this.siteName = (s.siteName as string) || this.siteName
          this.siteTitle = (s.siteTitle as string) || this.siteTitle
          this.siteDescription = (s.siteDescription as string) || this.siteDescription
          
          // Map visibility settings
          const visibilityKeys = [
            'showGroupBuy', 'showFlashSales', 'showSpecialOffers', 
            'showAuctions', 'showLotteries', 'showVendors', 
            'showBrands', 'showNewsletter', 'showHomeSlider',
            'showPersonalized', 'showQuadCards', 'showBarterPool',
            'showPersonalizedProducts', 'showPerformance', 'showRestaurants',
            'showAds'
          ]
          
          visibilityKeys.forEach(key => {
            if (s[key] !== undefined) {
              this.homepageSettings[key] = String(s[key])
            }
          })

          if (s.siteLogo) {
            const logo = s.siteLogo as string
            this.siteLogo = logo
            if (logo.startsWith('http')) {
              this.siteLogoUrl = logo
            } else {
              this.siteLogoUrl = `${useRuntimeConfig().public.apiBase}${logo}`
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch site settings:', error)
      }
    },

        setEcosystem(ecosystem: string) {
            this.currentEcosystem = ecosystem
            const config = useRuntimeConfig()
            const prefix = ecosystem === 'ticaritakas' ? 'ticaritakas_' :
                ecosystem === 'bazarx' ? 'bazarx_' :
                    ecosystem === 'barterborsa' ? 'barterborsa_' : ''

            const defaultNames: Record<string, string> = {
                ticaritakas: 'TicariTakas',
                bazarx: 'BazarX',
                barterborsa: 'BarterBorsa'
            }

            const defaultSubtitles: Record<string, string> = {
                ticaritakas: 'Ticari Takas Platformu',
                bazarx: 'Online Alışveriş Platformu',
                barterborsa: 'Barter Borsa Platformu'
            }

            const ecoName = this.settings[`${prefix}siteName`] as string
            this.ecosystemName = ecoName || defaultNames[ecosystem] || this.siteName

            const ecoLogo = this.settings[`${prefix}siteLogo`] as string
            if (ecoLogo) {
                this.ecosystemLogo = ecoLogo
                if (ecoLogo.startsWith('http')) {
                    this.ecosystemLogoUrl = ecoLogo
                } else {
                    this.ecosystemLogoUrl = `${config.public.apiBase}${ecoLogo}`
                }
            } else {
                this.ecosystemLogo = ''
                this.ecosystemLogoUrl = null
            }

            this.ecosystemSubtitle = defaultSubtitles[ecosystem] || 'Ticari Takas Platformu'
        }
    }
})
