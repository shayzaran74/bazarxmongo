<template>
  <div class="bg-white shadow rounded-2xl mb-6 overflow-hidden">
    <div class="px-4 sm:px-6 py-6 sm:py-8">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <!-- Avatar -->
        <div class="relative mx-auto sm:mx-0 flex-shrink-0">
          <div
            class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden"
          >
            <img
              v-if="user?.profile?.avatar"
              :src="getAvatarUrl(user.profile.avatar)"
              class="w-full h-full object-cover"
              alt="Avatar"
            >
            <span v-else>{{ getInitials(fullName || user?.email) }}</span>
          </div>
          <button
            class="absolute bottom-0 right-0 bg-white rounded-full p-1.5 sm:p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            @click="$emit('openAvatarUpload')"
          >
            <CameraIcon class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
          </button>
        </div>

        <div class="flex-1 text-center sm:text-left min-w-0">
          <h1 class="text-lg sm:text-2xl font-bold text-gray-900 truncate">
            {{ fullName || $t('profile.unnamedUser') }}
          </h1>
          <p class="text-sm text-gray-600 truncate">
            {{ user?.email }}
          </p>
          <div
            class="flex flex-wrap items-center justify-center sm:justify-start mt-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500"
          >
            <div class="flex items-center">
              <CalendarIcon class="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span class="truncate">{{ formatDate(user?.createdAt) }}</span>
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
              :class="user?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ user?.status === 'Active' ? $t('profile.active') : $t('profile.passive') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Mobile Logout button -->
      <div class="mt-6 pt-4 border-t border-gray-100 lg:hidden">
        <button
          class="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-100 active:scale-[0.98] transition-all"
          @click="$emit('logout')"
        >
          <ArrowLeftOnRectangleIcon class="h-5 w-5" />
          {{ $t('profile.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CameraIcon, CalendarIcon, ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  getAvatarUrl: {
    type: Function,
    default: (url) => url
  },
  getInitials: {
    type: Function,
    default: (name) => name?.charAt(0) || ''
  },
  formatDate: {
    type: Function,
    default: (date) => date
  }
})

const fullName = computed(() => {
  if (!props.user?.profile) return ''
  return `${props.user.profile.firstName} ${props.user.profile.lastName || ''}`.trim()
})

defineEmits(['openAvatarUpload', 'logout'])
</script>
