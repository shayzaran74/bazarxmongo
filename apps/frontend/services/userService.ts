import type { ApiResponse, UserDTO, LoyaltyStatus, LoyaltyHistoryItem, UserProfileStats, UserProfileUpdate } from '@barterborsa/shared-types'
import { useApi } from '~/services/api'

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export const userService = {
  async fetchProfile(): Promise<ApiResponse<UserDTO>> {
    const { $api } = useApi()
    return await $api<UserDTO>('/api/v1/user/profile')
  },

  async updateProfile(data: UserProfileUpdate): Promise<ApiResponse<{ user: UserDTO }>> {
    const { $api } = useApi()
    return await $api<{ user: UserDTO }>('/api/v1/user/profile', {
      method: 'PUT',
      body: data
    })
  },

  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    const { $api } = useApi()
    return await $api<void>('/api/v1/user/profile/change-password', {
      method: 'POST',
      body: data
    })
  },

  async fetchUserStats(): Promise<ApiResponse<{ stats: UserProfileStats }>> {
    const { $api } = useApi()
    return await $api<{ stats: UserProfileStats }>('/api/v1/user/profile/stats')
  },

  async fetchUserTier(): Promise<ApiResponse<unknown>> {
    const { $api } = useApi()
    return await $api<unknown>('/api/v1/tiers/me')
  },

  async fetchLoyaltyStatus(): Promise<ApiResponse<LoyaltyStatus>> {
    const { $api } = useApi()
    return await $api<LoyaltyStatus>('/api/v1/xp/balance')
  },

  async fetchLoyaltyHistory(): Promise<ApiResponse<LoyaltyHistoryItem[]>> {
    const { $api } = useApi()
    return await $api<LoyaltyHistoryItem[]>('/api/v1/xp/history')
  },

  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ url: string }>> {
    const { $api } = useApi()
    return await $api<{ url: string }>('/api/v1/upload?type=avatar', {
      method: 'POST',
      body: formData
    })
  }
}
