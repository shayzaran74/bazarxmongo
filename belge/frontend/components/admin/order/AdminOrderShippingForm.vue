<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-6">
      Kargo ve Teslimat Süreci
    </h2>

    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Kargo Firması</label>
          <input 
            :value="shippingUpdate.shippingCarrier" 
            placeholder="Aras, Yurtiçi vb."
            class="form-input focus:ring-primary-500 w-full"
            @input="updateField('shippingCarrier', $event.target.value)" 
          >
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Takip Numarası</label>
          <input 
            :value="shippingUpdate.trackingNumber" 
            placeholder="Takip no girin"
            class="form-input focus:ring-primary-500 w-full"
            @input="updateField('trackingNumber', $event.target.value)" 
          >
        </div>
      </div>

      <div>
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Tahmini Teslimat</label>
        <input 
          :value="shippingUpdate.estimatedDelivery" 
          type="date"
          class="form-input focus:ring-primary-500 w-full"
          @input="updateField('estimatedDelivery', $event.target.value)" 
        >
      </div>

      <div>
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Sipariş Notları (Dahili)</label>
        <textarea 
          :value="shippingUpdate.notes" 
          rows="3"
          class="form-input focus:ring-primary-500 w-full" 
          placeholder="Yönetici notları..."
          @input="updateField('notes', $event.target.value)"
        />
      </div>

      <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-gray-900">
            Durumu Güncelle
          </p>
          <p class="text-xs text-gray-500 mt-0.5">
            Müşteriye bildirim gidecektir
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <select 
            :value="shippingUpdate.status" 
            class="p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-primary-500 outline-none"
            @input="updateField('status', $event.target.value)"
          >
            <option value="Pending">
              Beklemede
            </option>
            <option value="Processing">
              Hazırlanıyor
            </option>
            <option value="Shipped">
              Kargoya Verildi
            </option>
            <option value="Delivered">
              Teslim Edildi
            </option>
            <option value="Cancelled">
              İptal Edildi
            </option>
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

<script setup>
const props = defineProps({
  shippingUpdate: { type: Object, required: true },
  updating: Boolean
})

const emit = defineEmits(['update:shippingUpdate', 'update-status'])

const updateField = (field, value) => {
  emit('update:shippingUpdate', { ...props.shippingUpdate, [field]: value })
}
</script>
