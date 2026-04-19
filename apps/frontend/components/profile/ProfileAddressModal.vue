<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      />
      <div class="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh] transform transition-all">
        <h3 class="text-2xl font-black mb-6 text-gray-900">
          {{ isEditing ? $t('profile.editAddress') : $t('profile.addNewAddress') }}
        </h3>
        
        <form
          class="space-y-5"
          @submit.prevent="$emit('save')"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ $t('profile.addressTitle') }}</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all"
              >
            </div>
            
            <div class="col-span-2 md:col-span-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ $t('profile.fullName') }}</label>
              <input
                v-model="form.fullName"
                type="text"
                required
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all"
              >
            </div>
            
            <div class="col-span-2 md:col-span-1">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ $t('profile.phone') }}</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all"
              >
            </div>
            
            <div class="col-span-2">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ $t('profile.addressLine') }}</label>
              <textarea
                v-model="form.addressLine"
                required
                rows="3"
                class="w-full bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all resize-none"
              />
            </div>
            
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ $t('profile.city') }}</label>
              <select
                v-model="form.city"
                required
                class="w-full bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 border border-transparent focus:border-primary-500 transition-all outline-none"
                @change="form.district = ''"
              >
                <option value="">
                  {{ $t('profile.selectCity') }}
                </option>
                <option
                  v-for="(districts, city) in iller"
                  :key="city"
                  :value="city"
                >
                  {{ city }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{{ $t('profile.district') }}</label>
              <select
                v-model="form.district"
                :disabled="!form.city"
                required
                class="w-full bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 border border-transparent focus:border-primary-500 transition-all outline-none disabled:opacity-50"
              >
                <option value="">
                  {{ $t('profile.selectDistrict') }}
                </option>
                <option
                  v-for="district in (iller[form.city] || [])"
                  :key="district"
                  :value="district"
                >
                  {{ district }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center gap-3 py-2">
            <input
              id="isDefault"
              v-model="form.isDefault"
              type="checkbox" 
              class="w-5 h-5 rounded-md text-primary-600 focus:ring-primary-500 border-gray-300"
            >
            <label
              for="isDefault"
              class="text-sm font-bold text-gray-700 cursor-pointer select-none"
            >{{ $t('profile.defaultAddress') }}</label>
          </div>
          
          <div class="flex gap-4 pt-4">
            <button
              type="button"
              class="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors" 
              @click="$emit('close')"
            >
              {{ $t('profile.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-[2] bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {{ loading ? $t('profile.saving') : $t('profile.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { iller } from '~/assets/css/data/component/iller'

const form = defineModel('form', { type: Object })

defineProps({
  show: Boolean,
  isEditing: Boolean,
  loading: Boolean
})

defineEmits(['close', 'save'])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
