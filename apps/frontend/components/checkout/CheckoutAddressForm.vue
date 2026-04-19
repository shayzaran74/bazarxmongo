<template>
  <div class="mb-10">
    <h3 class="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
      Teslimat Adresi
    </h3>

    <div
      v-if="loading"
      class="flex justify-center py-4"
    >
      <div class="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>

    <div
      v-else-if="addresses && addresses.length > 0"
      class="space-y-4 mb-6"
    >
      <div 
        v-for="address in addresses" 
        :key="address.id" 
        class="p-4 border-2 rounded-2xl cursor-pointer transition-all relative"
        :class="selectedAddressId === address.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'"
        @click="$emit('update:selectedAddressId', address.id)"
      >
        <div class="flex items-center gap-3">
          <div class="bg-gray-100 p-2 rounded-lg">
            <MapPinIcon 
              class="h-5 w-5 text-gray-400"
              :class="{ 'text-primary-600': selectedAddressId === address.id }" 
            />
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-gray-900">
                {{ address.title }}
              </p>
              <span
                v-if="address.isDefault"
                class="text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full"
              >VARSAYILAN</span>
            </div>
            <p class="text-xs text-gray-600 mt-1">
              {{ address.fullName }} - {{ address.phone }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ address.addressLine }}, {{ address.district }} / {{ address.city }}
            </p>
          </div>
        </div>
      </div>

      <button 
        class="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 px-1"
        @click="$emit('update:showNewAddressForm', !showNewAddressForm)"
      >
        <PlusIcon class="h-3.5 w-3.5" />
        {{ showNewAddressForm ? 'Adres Seçimine Dön' : 'Yeni Adres Ekle' }}
      </button>
    </div>

    <div
      v-if="showNewAddressForm || !addresses?.length"
      class="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 animate-slide-up"
    >
      <div class="space-y-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adres Başlığı (Örn: Ev, İş)</label>
        <input 
          :value="newAddress.title" 
          type="text" 
          class="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
          placeholder="Evim"
          @input="updateNewAddress('title', ($event.target as HTMLInputElement).value)" 
        >
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ad Soyad *</label>
          <input 
            :value="newAddress.fullName" 
            type="text" 
            class="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
            placeholder="İsim Soyisim"
            required
            @input="updateNewAddress('fullName', ($event.target as HTMLInputElement).value)" 
          >
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefon *</label>
          <input 
            :value="newAddress.phone" 
            type="tel" 
            class="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
            placeholder="5XX XXX XX XX"
            required
            @input="updateNewAddress('phone', ($event.target as HTMLInputElement).value)" 
          >
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tam Adres *</label>
        <textarea 
          :value="newAddress.addressLine"
          class="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all min-h-[100px] resize-none"
          rows="3"
          placeholder="Sokak, Mahalle, No..."
          required
          @input="updateNewAddress('addressLine', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Şehir *</label>
          <select 
            :value="newAddress.city" 
            class="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
            required
            @change="updateNewAddress('city', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">
              Şehir Seçin
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
        <div class="space-y-1">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İlçe *</label>
          <select 
            :value="newAddress.district"
            class="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20"
            :disabled="!newAddress.city"
            required
            @change="updateNewAddress('district', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">
              İlçe Seçin
            </option>
            <option
              v-for="district in (newAddress.city ? (iller[newAddress.city as keyof typeof iller] || []) : [])"
              :key="district"
              :value="district"
            >
              {{ district }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-2 pt-2">
        <input
          id="saveAddress"
          :checked="saveNewAddress"
          type="checkbox"
          class="rounded text-primary-600"
          @change="$emit('update:saveNewAddress', ($event.target as HTMLInputElement).checked)"
        >
        <label
          for="saveAddress"
          class="text-[10px] font-black text-gray-400 uppercase"
        >Bu adresi profilime kaydet</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapPinIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { iller } from '~/assets/css/data/component/iller'
import type { CheckoutAddress, CheckoutNewAddress } from '@barterborsa/shared-types'

const props = defineProps({
  addresses: { type: Array as () => CheckoutAddress[], default: () => [] },
  loading: { type: Boolean, default: false },
  selectedAddressId: { type: [String, Number] as import('vue').PropType<string | number | null>, default: null },
  showNewAddressForm: { type: Boolean, default: false },
  newAddress: { type: Object as () => CheckoutNewAddress, required: true },
  saveNewAddress: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:selectedAddressId',
  'update:showNewAddressForm',
  'update:newAddress',
  'update:saveNewAddress'
])

const updateNewAddress = (field: keyof CheckoutNewAddress, value: string) => {
  const updated = { ...props.newAddress, [field]: value }
  if (field === 'city') updated.district = ''
  emit('update:newAddress', updated)
}
</script>
