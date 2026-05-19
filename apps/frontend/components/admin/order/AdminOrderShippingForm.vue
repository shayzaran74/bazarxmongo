<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-6">Kargo ve Teslimat Süreci</h2>

    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Kargo Firması</label>
          <input
            :value="shippingUpdate.shippingCarrier"
            placeholder="Aras, Yurtiçi vb."
            class="form-input focus:ring-primary-500 w-full"
            @input="updateField('shippingCarrier', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Takip Numarası</label>
          <input
            :value="shippingUpdate.trackingNumber"
            placeholder="Takip no girin"
            class="form-input focus:ring-primary-500 w-full"
            @input="updateField('trackingNumber', ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <div>
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Tahmini Teslimat</label>
        <input
          :value="shippingUpdate.estimatedDelivery"
          type="date"
          class="form-input focus:ring-primary-500 w-full"
          @input="updateField('estimatedDelivery', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <div>
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Sipariş Notları (Dahili)</label>
        <textarea
          :value="shippingUpdate.notes"
          rows="3"
          class="form-input focus:ring-primary-500 w-full"
          placeholder="Yönetici notları..."
          @input="updateField('notes', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-gray-900">Durumu Güncelle</p>
          <p class="text-xs text-gray-500 mt-0.5">Müşteriye bildirim gidecektir</p>
        </div>
        <div class="flex items-center space-x-3">
          <select
            :value="shippingUpdate.status"
            class="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary-500 outline-none"
            @input="updateField('status', ($event.target as HTMLSelectElement).value)"
          >
            <option value="PENDING">Beklemede</option>
            <option value="PAID">Ödendi</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="PROCESSING">Hazırlanıyor</option>
            <option value="PREPARING">Mutfakta</option>
            <option value="READY">Hazır</option>
            <option value="SHIPPED">Kargolandı</option>
            <option value="DELIVERED">Teslim Edildi</option>
            <option value="COMPLETED">Tamamlandı</option>
            <option value="CANCELLED">İptal Edildi</option>
          </select>
          <button
            :disabled="updating"
            class="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
            @click="$emit('update-status')"
          >
            <span v-if="updating">Güncelleniyor...</span>
            <span v-else>Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ShippingUpdate {
  trackingNumber: string
  shippingCarrier: string
  estimatedDelivery: string
  notes: string
  status: string
}

const props = defineProps<{
  shippingUpdate: ShippingUpdate
  updating: boolean
}>()

const emit = defineEmits<{
  (e: 'update:shippingUpdate', value: ShippingUpdate): void
  (e: 'update-status'): void
}>()

const updateField = <K extends keyof ShippingUpdate>(field: K, value: ShippingUpdate[K]) => {
  emit('update:shippingUpdate', { ...props.shippingUpdate, [field]: value })
}
</script>
