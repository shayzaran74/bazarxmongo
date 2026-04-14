<template>
  <div class="space-y-6">
    <form
      class="space-y-6 max-w-md"
      @submit.prevent="$emit('changePassword')"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.currentPassword') }}</label>
          <input
            v-model="form.currentPassword"
            type="password"
            required
            class="w-full border border-gray-300 rounded-xl px-4 py-3"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.newPassword') }}</label>
          <input
            v-model="form.newPassword"
            type="password"
            required
            minlength="8"
            class="w-full border border-gray-300 rounded-xl px-4 py-3"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('profile.confirmNewPassword') }}</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full border border-gray-300 rounded-xl px-4 py-3"
          >
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
const form = defineModel('form', { type: Object })

defineProps({
  loading: Boolean
})

defineEmits(['changePassword'])
</script>
