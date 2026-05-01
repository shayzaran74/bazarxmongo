<template>
  <div class="space-y-6">
    <form
      class="space-y-6 max-w-md"
      @submit.prevent="$emit('changePassword')"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.currentPassword') }}</label>
          <div class="relative">
            <input
              v-model="form.currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              required
              class="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10"
            >
            <button 
              type="button" 
              @click="showCurrent = !showCurrent"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon v-if="!showCurrent" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.newPassword') }}</label>
          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="showNew ? 'text' : 'password'"
              required
              minlength="8"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10"
            >
            <button 
              type="button" 
              @click="showNew = !showNew"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon v-if="!showNew" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          
          <!-- Strength Meter -->
          <div v-if="form.newPassword" class="mt-2">
            <div class="flex gap-1 h-1.5">
              <div 
                v-for="i in 4" :key="i"
                class="flex-1 rounded-full transition-all duration-500"
                :class="i <= passwordStrength ? strengthColor : 'bg-gray-100'"
              ></div>
            </div>
            <p class="text-[10px] font-bold mt-1 uppercase tracking-widest" :class="strengthTextColor">
              Şifre Gücü: {{ strengthLabel }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.confirmNewPassword') }}</label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              required
              class="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10"
              :class="{ 'border-red-500': form.confirmPassword && form.newPassword !== form.confirmPassword }"
            >
            <button 
              type="button" 
              @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <EyeIcon v-if="!showConfirm" class="h-5 w-5" />
              <EyeSlashIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="text-[10px] text-red-500 font-bold mt-1 uppercase">Şifreler eşleşmiyor</p>
        </div>
      </div>
      <button
        type="submit"
        :disabled="loading || form.newPassword !== form.confirmPassword"
        class="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {{ loading ? $t('common.processing') : $t('profile.changePassword') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const form = defineModel('form', { type: Object })

defineProps({
  loading: Boolean
})

defineEmits(['changePassword'])

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const passwordStrength = computed(() => {
  const p = form.value.newPassword
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s === 0) return ''
  if (s === 1) return 'Zayıf'
  if (s === 2) return 'Orta'
  if (s === 3) return 'Güçlü'
  return 'Çok Güçlü'
})

const strengthColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'bg-red-500'
  if (s === 2) return 'bg-yellow-500'
  if (s === 3) return 'bg-green-500'
  return 'bg-emerald-500'
})

const strengthTextColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'text-red-500'
  if (s === 2) return 'text-yellow-600'
  if (s === 3) return 'text-green-600'
  return 'text-emerald-600'
})
</script>
