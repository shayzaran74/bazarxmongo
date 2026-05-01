<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between py-2 border-b border-gray-100">
      <div>
        <p class="font-medium text-gray-800">
          {{ $t('profile.emailNotifications') }}
        </p>
      </div>
      <ToggleSwitch v-model="form.emailNotifications" />
    </div>
    <div class="flex items-center justify-between py-2 border-b border-gray-100">
      <div>
        <p class="font-medium text-gray-800">
          {{ $t('profile.smsNotifications') }}
        </p>
      </div>
      <ToggleSwitch v-model="form.smsNotifications" />
    </div>
    <div class="flex items-center justify-between py-2 border-b border-gray-100">
      <div>
        <p class="font-medium text-gray-800">
          Dil Seçimi
        </p>
      </div>
      <select v-model="form.language" class="border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none">
        <option value="tr">Türkçe</option>
        <option value="en">English</option>
      </select>
    </div>
    <div class="flex items-center justify-between py-2 border-b border-gray-100">
      <div>
        <p class="font-medium text-gray-800">
          Tema
        </p>
      </div>
      <select v-model="form.theme" class="border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none">
        <option value="light">Açık</option>
        <option value="dark">Koyu</option>
      </select>
    </div>
    <div class="flex items-center justify-between py-2 border-b border-gray-100">
      <div>
        <p class="font-medium text-gray-800">
          Gizlilik
        </p>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Profilinizi kimler görebilir?</p>
      </div>
      <select v-model="form.privacy" class="border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none">
        <option value="public">Herkese Açık</option>
        <option value="private">Sadece Ben</option>
      </select>
    </div>
    <div class="flex justify-end pt-4">
      <button
        class="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 font-semibold transition-colors"
        @click="$emit('save')"
      >
        {{ $t('profile.savePreferences') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import ToggleSwitch from '~/components/common/ToggleSwitch.vue'

const form = defineModel('form', { type: Object })

defineEmits(['save'])
</script>
