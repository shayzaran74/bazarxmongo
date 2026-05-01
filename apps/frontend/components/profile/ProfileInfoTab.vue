<template>
  <div class="space-y-6">
    <form
      class="space-y-6"
      @submit.prevent="$emit('update')"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.firstName') }}</label>
          <input
            v-model="form.firstName"
            type="text"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.lastName') }}</label>
          <input
            v-model="form.lastName"
            type="text"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.email') }}</label>
          <input
            :value="user?.email"
            type="email"
            disabled
            class="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 text-base"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.phone') }}</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.birthday') || 'Doğum Tarihi' }}</label>
          <input
            v-model="form.birthday"
            type="date"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.gender') || 'Cinsiyet' }}</label>
          <select
            v-model="form.gender"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base appearance-none bg-white"
          >
            <option value="">{{ $t('profile.selectGender') || 'Seçiniz' }}</option>
            <option value="MALE">{{ $t('profile.genderMale') || 'Erkek' }}</option>
            <option value="FEMALE">{{ $t('profile.genderFemale') || 'Kadın' }}</option>
            <option value="OTHER">{{ $t('profile.genderOther') || 'Belirtmek İstemiyorum' }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.district') || 'İlçe' }}</label>
          <input
            v-model="form.district"
            type="text"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.neighborhood') || 'Mahalle' }}</label>
          <input
            v-model="form.neighborhood"
            type="text"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.accountStatus') }}</label>
          <div class="flex items-center gap-2">
            <span
              :class="['px-3 py-2 rounded-xl text-sm font-medium', user?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']"
            >
              {{ user?.status === 'Active' ? '✅ ' + $t('profile.active') : '❌ ' + $t('profile.passive') }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="loading"
          class="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 font-semibold disabled:opacity-50"
        >
          {{ loading ? $t('profile.updating') : $t('profile.updateProfile') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const form = defineModel('form', { type: Object })

defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  loading: Boolean
})

defineEmits(['update'])
</script>
