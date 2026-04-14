import { useApi } from '~/services/api'

export const useSettingsService = () => {
  const { $api } = useApi()

  return {
    async getSettings() {
      return await $api('/api/settings')
    }
  }
}
