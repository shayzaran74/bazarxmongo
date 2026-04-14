<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        Ayarlar
      </h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Settings Menu -->
        <div class="lg:col-span-1">
          <nav class="space-y-1">
            <button
              :class="[
                activeTab === 'account' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group rounded-md px-3 py-2 text-sm font-medium w-full text-left flex items-center'
              ]"
              @click="activeTab = 'account'"
            >
              <UserCircleIcon class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" />
              <span>Hesap</span>
            </button>
            
            <button
              :class="[
                activeTab === 'security' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group rounded-md px-3 py-2 text-sm font-medium w-full text-left flex items-center'
              ]"
              @click="activeTab = 'security'"
            >
              <ShieldCheckIcon class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" />
              <span>Güvenlik</span>
            </button>
            
            <button
              :class="[
                activeTab === 'notifications' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'group rounded-md px-3 py-2 text-sm font-medium w-full text-left flex items-center'
              ]"
              @click="activeTab = 'notifications'"
            >
              <BellIcon class="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" />
              <span>Bildirimler</span>
            </button>
          </nav>
        </div>
        
        <!-- Settings Content -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">
                {{ activeTab === 'account' ? 'Hesap Ayarları' : 
                  activeTab === 'security' ? 'Güvenlik Ayarları' : 
                  'Bildirim Ayarları' }}
              </h2>
            </div>
            <div class="px-4 py-5 sm:p-6">
              <!-- Account Settings -->
              <div v-if="activeTab === 'account'">
                <form @submit.prevent="updateAccount">
                  <div class="space-y-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Dil</label>
                      <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option>Türkçe</option>
                        <option>English</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Zaman Dilimi</label>
                      <select class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option>GMT+3 (İstanbul)</option>
                        <option>GMT+0 (UTC)</option>
                      </select>
                    </div>
                    
                    <div class="flex items-center">
                      <input 
                        type="checkbox" 
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      >
                      <label class="ml-2 block text-sm text-gray-900">
                        E-posta bültenine abone ol
                      </label>
                    </div>
                    
                    <div class="flex items-center">
                      <input 
                        type="checkbox" 
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      >
                      <label class="ml-2 block text-sm text-gray-900">
                        Kişiselleştirilmiş önerileri etkinleştir
                      </label>
                    </div>
                  </div>
                  
                  <div class="mt-6">
                    <button 
                      type="submit"
                      class="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Ayarları Kaydet
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- Security Settings -->
              <div v-if="activeTab === 'security'">
                <div class="space-y-6">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      Şifre Değiştir
                    </h3>
                    <form
                      class="space-y-4"
                      @submit.prevent="changePassword"
                    >
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                        <input 
                          v-model="passwordForm.currentPassword"
                          type="password" 
                          required
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                        <input 
                          v-model="passwordForm.newPassword"
                          type="password" 
                          required
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                      </div>
                      
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                        <input 
                          v-model="passwordForm.confirmPassword"
                          type="password" 
                          required
                          class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                      </div>
                      
                      <button 
                        type="submit"
                        :disabled="passwordLoading"
                        class="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {{ passwordLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir' }}
                      </button>
                    </form>
                  </div>
                  
                  <div class="border-t border-gray-200 pt-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      Oturumlar
                    </h3>
                    <div class="bg-gray-50 rounded-lg p-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-gray-900">
                            Bu cihaz
                          </p>
                          <p class="text-sm text-gray-500">
                            Son aktivite: Bugün 14:30
                          </p>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Notification Settings -->
              <div v-if="activeTab === 'notifications'">
                <div class="space-y-6">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      Bildirim Tercihleri
                    </h3>
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-gray-900">
                            Sipariş Güncellemeleri
                          </p>
                          <p class="text-sm text-gray-500">
                            Sipariş durumu değişiklikleri
                          </p>
                        </div>
                        <Switch
                          v-model="notificationSettings.orderUpdates"
                          :class="[
                            notificationSettings.orderUpdates ? 'bg-primary-600' : 'bg-gray-200',
                            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          ]"
                        >
                          <span
                            :class="[
                              notificationSettings.orderUpdates ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                            ]"
                          >
                            <span
                              :class="[
                                notificationSettings.orderUpdates ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              :class="[
                                notificationSettings.orderUpdates ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-primary-600"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </Switch>
                      </div>
                      
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-gray-900">
                            Yeni Ürün Bildirimleri
                          </p>
                          <p class="text-sm text-gray-500">
                            Yeni eklenen ürünler
                          </p>
                        </div>
                        <Switch
                          v-model="notificationSettings.newProducts"
                          :class="[
                            notificationSettings.newProducts ? 'bg-primary-600' : 'bg-gray-200',
                            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          ]"
                        >
                          <span
                            :class="[
                              notificationSettings.newProducts ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                            ]"
                          >
                            <span
                              :class="[
                                notificationSettings.newProducts ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              :class="[
                                notificationSettings.newProducts ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-primary-600"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </Switch>
                      </div>
                      
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-gray-900">
                            İndirim Bildirimleri
                          </p>
                          <p class="text-sm text-gray-500">
                            Özel kampanyalar ve indirimler
                          </p>
                        </div>
                        <Switch
                          v-model="notificationSettings.discounts"
                          :class="[
                            notificationSettings.discounts ? 'bg-primary-600' : 'bg-gray-200',
                            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          ]"
                        >
                          <span
                            :class="[
                              notificationSettings.discounts ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                            ]"
                          >
                            <span
                              :class="[
                                notificationSettings.discounts ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              :class="[
                                notificationSettings.discounts ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-primary-600"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </Switch>
                      </div>
                    </div>
                  </div>
                  
                  <div class="border-t border-gray-200 pt-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                      Bildirim Yöntemleri
                    </h3>
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-gray-900">
                            E-posta
                          </p>
                          <p class="text-sm text-gray-500">
                            Bildirimleri e-posta ile al
                          </p>
                        </div>
                        <Switch
                          v-model="notificationSettings.email"
                          :class="[
                            notificationSettings.email ? 'bg-primary-600' : 'bg-gray-200',
                            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          ]"
                        >
                          <span
                            :class="[
                              notificationSettings.email ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                            ]"
                          >
                            <span
                              :class="[
                                notificationSettings.email ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              :class="[
                                notificationSettings.email ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-primary-600"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </Switch>
                      </div>
                      
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-gray-900">
                            Anlık Bildirimler
                          </p>
                          <p class="text-sm text-gray-500">
                            Tarayıcı bildirimleri
                          </p>
                        </div>
                        <Switch
                          v-model="notificationSettings.push"
                          :class="[
                            notificationSettings.push ? 'bg-primary-600' : 'bg-gray-200',
                            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          ]"
                        >
                          <span
                            :class="[
                              notificationSettings.push ? 'translate-x-5' : 'translate-x-0',
                              'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                            ]"
                          >
                            <span
                              :class="[
                                notificationSettings.push ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-gray-400"
                                fill="none"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                            </span>
                            <span
                              :class="[
                                notificationSettings.push ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                                'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity'
                              ]"
                              aria-hidden="true"
                            >
                              <svg
                                class="h-3 w-3 text-primary-600"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-5.707a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                              </svg>
                            </span>
                          </span>
                        </Switch>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  BellIcon 
} from '@heroicons/vue/24/outline'
import { Switch } from '@headlessui/vue'

// Layout
definePageMeta({
  layout: 'default'
})

// Page meta
useHead({
  title: 'Ayarlar - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Kullanıcı ayarları'
    }
  ]
})

// Store
const authStore = useAuthStore()

// State
const activeTab = ref('account')
const passwordLoading = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = ref({
  orderUpdates: true,
  newProducts: true,
  discounts: false,
  email: true,
  push: true
})

// Change password
const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    const toast = useNuxtApp().$toast
    toast.error('Yeni şifreler eşleşmiyor!')
    return
  }
  
  passwordLoading.value = true
  
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    // Show success message
    const toast = useNuxtApp().$toast
    toast.success('Şifre başarıyla değiştirildi!')
    
    // Reset form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('Change password error:', error)
    // Show error message
    const toast = useNuxtApp().$toast
    toast.error('Şifre değiştirilirken bir hata oluştu!')
  } finally {
    passwordLoading.value = false
  }
}

// Update account settings
const updateAccount = () => {
  // Show success message
  const toast = useNuxtApp().$toast
  toast.success('Ayarlar kaydedildi!')
}
</script>