<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Profile Header -->
      <ProfileHeader 
        :user="user"
        :get-avatar-url="getAvatarUrl"
        :get-initials="getInitials"
        :format-date="formatDate"
        @open-avatar-upload="showAvatarModal = true"
        @logout="handleLogout"
      />

      <!-- Navigation & Tabs -->
      <div class="bg-white shadow rounded-2xl overflow-hidden">
        <ProfileMenu 
          v-model:show-mobile-menu="showMobileMenu"
          :tabs="tabs"
          :active-tab="activeTab"
          :active-tab-data="activeTabData"
          @tab-click="handleTabClick"
        />

        <div class="p-4 sm:p-6">
          <!-- Profile Info Tab -->
          <ProfileInfoTab 
            v-if="activeTab === 'profile'"
            v-model:form="profileForm"
            :user="user"
            :loading="profileLoading"
            @update="updateProfile"
          />

          <!-- Loyalty Tab -->
          <ProfileLoyaltyTab 
            v-if="activeTab === 'loyalty'"
            :loyalty-data="loyaltyStatusMapped"
            :history="loyaltyHistory"
            :loading="loyaltyHistoryLoading"
            :format-date="formatDate"
          />

          <!-- Addresses Tab -->
          <ProfileAddressesTab 
            v-if="activeTab === 'addresses'"
            :address-store="addressStore"
            @add="openAddressModal()"
            @edit="openAddressModal"
            @delete="deleteAddress"
          />

          <!-- Wallet Tab -->
          <ProfileWalletTab 
            v-if="activeTab === 'wallet'"
            :wallet="wallet"
            :user="user"
            :transactions="transactions"
            :loading="txLoading"
            :format-price="formatPriceNum"
            :format-date="formatDate"
            @top-up-success="loadWalletData"
          />

          <!-- Security Tab -->
          <ProfileSecurityTab 
            v-if="activeTab === 'security'"
            v-model:form="passwordForm"
            :loading="passwordLoading"
            @change-password="changePassword"
          />

          <!-- Activity Tab -->
          <ProfileActivityTab 
            v-if="activeTab === 'activity'"
            :user="user"
            :tier-data="userTierData"
            :loyalty-data="loyaltyStatusMapped"
            :stats="userStats"
            :format-price="formatPriceNum"
          />

          <!-- Preferences Tab -->
          <ProfilePreferencesTab 
            v-if="activeTab === 'preferences'"
            v-model:form="preferences"
            @save="savePreferences"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProfileAvatarModal 
      :show="showAvatarModal"
      :preview="avatarPreview"
      :loading="avatarUploading"
      @close="showAvatarModal = false"
      @trigger-upload="triggerAvatarUpload"
      @save="uploadAvatar"
    />

    <ProfileAddressModal 
      v-model:form="addressForm"
      :show="showAddressModal"
      :is-editing="isEditingAddress"
      :loading="addressStore.loading"
      @close="showAddressModal = false"
      @save="saveAddress"
    />

    <!-- Hidden Avatar Input -->
    <input 
      ref="avatarInput" 
      type="file" 
      accept="image/*" 
      class="hidden" 
      @change="onAvatarFileChange" 
    >
  </div>
</template>

<script setup>
import { useProfile } from '~/composables/useProfile'

// Components
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import ProfileMenu from '~/components/profile/ProfileMenu.vue'
import ProfileInfoTab from '~/components/profile/ProfileInfoTab.vue'
import ProfileLoyaltyTab from '~/components/profile/ProfileLoyaltyTab.vue'
import ProfileAddressesTab from '~/components/profile/ProfileAddressesTab.vue'
import ProfileWalletTab from '~/components/profile/ProfileWalletTab.vue'
import ProfileSecurityTab from '~/components/profile/ProfileSecurityTab.vue'
import ProfileActivityTab from '~/components/profile/ProfileActivityTab.vue'
import ProfilePreferencesTab from '~/components/profile/ProfilePreferencesTab.vue'
import ProfileAvatarModal from '~/components/profile/ProfileAvatarModal.vue'
import ProfileAddressModal from '~/components/profile/ProfileAddressModal.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })
const { t } = useI18n()
useHead({ title: `${t('profile.title')} - BazarX` })

const {
  user,
  activeTab,
  tabs,
  activeTabData,
  showMobileMenu,
  profileLoading,
  profileForm,
  showAvatarModal,
  avatarUploading,
  avatarPreview,
  loyaltyStatusMapped,
  loyaltyHistory,
  loyaltyHistoryLoading,
  userTierData,
  wallet,
  transactions,
  txLoading,
  passwordLoading,
  passwordForm,
  userStats,
  preferences,
  showAddressModal,
  isEditingAddress,
  addressForm,
  addressStore,

  handleTabClick,
  handleAvatarChange,
  uploadAvatar,
  updateProfile,
  fetchLoyaltyData,
  loadWalletData,
  changePassword,
  fetchUserStats,
  savePreferences,
  openAddressModal,
  saveAddress,
  deleteAddress,
  handleLogout,

  getAvatarUrl,
  getInitials,
  formatDate,
  formatPriceNum
} = useProfile()

const avatarInput = ref(null)

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const onAvatarFileChange = (event) => {
  const file = event.target.files?.[0]
  if (file) handleAvatarChange(file)
}

// Initial Data Fetch
onMounted(() => {
  fetchUserStats()
  fetchLoyaltyData()
  loadWalletData()
  addressStore.fetchAddresses()
})
</script>