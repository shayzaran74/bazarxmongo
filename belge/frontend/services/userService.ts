import type { ApiResponse, UserDTO, LoyaltyStatus, LoyaltyHistoryItem, UserProfileStats } from '@barterborsa/shared-types'
import { useApi } from '~/services/api'

export interface UserProfileUpdate {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  district?: string
  neighborhood?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}


export const userService = {
  async fetchProfile() {
    const { $api } = useApi()
    return await $api<ApiResponse<UserDTO>>('/api/user/profile')
  },

  async updateProfile(data: UserProfileUpdate) {
    const { $api } = useApi()
    return await $api<ApiResponse<{ user: UserDTO }>>('/api/user/profile', {
      method: 'PUT',
      body: data
    })
  },

  async changePassword(data: ChangePasswordData) {
    const { $api } = useApi()
    return await $api<ApiResponse<void>>('/api/user/change-password', {
      method: 'POST',
      body: data
    })
  },

  async fetchUserStats() {
    const { $api } = useApi()
    return await $api<ApiResponse<{ stats: UserProfileStats }>>('/api/user/stats')
  },

  async fetchUserTier() {
    const { $api } = useApi()
    return await $api<ApiResponse<unknown>>('/api/tiers/user')
  },

  async fetchLoyaltyStatus() {
    const { $api } = useApi()
    return await $api<ApiResponse<LoyaltyStatus>>('/api/loyalty/status')
  },

  async fetchLoyaltyHistory() {
    const { $api } = useApi()
    return await $api<ApiResponse<LoyaltyHistoryItem[]>>('/api/loyalty/history')
  },

  async uploadAvatar(formData: FormData) {
    const { $api } = useApi()
    return await $api<ApiResponse<{ url: string }>>('/api/upload?type=avatar', {
      method: 'POST',
      body: formData
    })
  }
}
