<template>
  <Teleport to="body">
    <div
      v-if="vendor"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gray-50 border-b p-6 flex justify-between items-center">
          <h2 class="text-xl font-bold">
            {{ vendor.profile?.storeName || vendor.company?.name || 'İsimsiz Satıcı' }}
          </h2>
          <div class="flex items-center gap-4">
            <button
              class="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1"
              title="Satıcıyı Sil"
              @click="$emit('delete', vendor.id)"
            >
              🗑️ Sil
            </button>
            <button
              class="text-gray-500 hover:text-gray-700"
              @click="$emit('close')"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Durum Yönetimi (Onay Bekleyenler İçin) -->
          <div
            v-if="vendor.status === 'PENDING'"
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <h3 class="font-semibold mb-4">
              Onay Durumunu Ayarla
            </h3>
            <div class="flex gap-4">
              <button
                :disabled="actionLoading"
                class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                @click="$emit('approve', vendor.id)"
              >
                {{ actionLoading ? 'İşleniyor...' : '✓ Onayla' }}
              </button>
              <button
                class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold"
                @click="$emit('update:showRejectForm', true)"
              >
                ✗ Reddet
              </button>
            </div>

            <!-- Red Formu -->
            <div
              v-if="showRejectForm"
              class="mt-4 bg-white border border-red-200 rounded-lg p-4"
            >
              <textarea 
                :value="rejectionReason"
                placeholder="Red nedenini açıklayın..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows="3"
                @input="$emit('update:rejectionReason', $event.target.value)"
              />
              <div class="flex gap-2 mt-4">
                <button
                  :disabled="actionLoading || !rejectionReason"
                  class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                  @click="$emit('reject', vendor.id)"
                >
                  {{ actionLoading ? 'İşleniyor...' : 'Reddet' }}
                </button>
                <button
                  class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                  @click="$emit('cancel-reject')"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>

          <!-- Satıcı Tipi Ayarları (v1.2 - Kesin Çözüm) -->
          <div
            v-if="vendor"
            class="bg-orange-50 border border-orange-200 rounded-lg p-4"
          >
            <h3 class="font-bold text-orange-900 mb-2 flex justify-between">
              <span>🍴 Satıcı Tipi Ayarları (Restoran vb.)</span>
              <span class="text-[10px] text-orange-400 font-normal italic">v1.2</span>
            </h3>
            <div class="flex gap-4 items-end">
              <div class="flex-1">
                <label class="block text-xs font-semibold text-orange-700 mb-1">Satıcı Kategorisi/Tipi</label>
                <select
                  :value="vendor.vendorType || 'INDIVIDUAL'"
                  class="w-full px-3 py-2 border border-orange-200 rounded-lg bg-white"
                  @change="vendor.vendorType = $event.target.value"
                >
                  <option value="INDIVIDUAL">Bireysel Satıcı</option>
                  <option value="CORPORATE">Kurumsal Satıcı</option>
                  <option value="RESTAURANT">Restoran / Yemek</option>
                  <option value="SERVICE">Hizmet Sağlayıcı</option>
                </select>
              </div>
              <button
                class="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 h-[42px]"
                @click="$emit('update-type', vendor)"
              >
                Tipi Güncelle
              </button>
            </div>
          </div>

          <!-- Kurumsal İş Ortağı Ayarları -->
          <div
            v-if="vendor && vendor.status === 'APPROVED'"
            class="bg-purple-50 border border-purple-200 rounded-lg p-4"
          >
            <h3 class="font-bold text-purple-900 mb-2">
              🏢 Kurumsal İş Ortağı (B2B) Ayarları
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-2">
                <input
                  id="isB2B"
                  type="checkbox" 
                  :checked="vendor.b2bData?.isB2B"
                  class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  @change="vendor.b2bData = vendor.b2bData || {}; vendor.b2bData.isB2B = $event.target.checked"
                >
                <label
                  for="isB2B"
                  class="text-sm font-semibold text-purple-900"
                >B2B Kurumsal İş Ortağı</label>
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-700 mb-1">Kurumsal Tier</label>
                <select
                  :value="vendor.b2bData?.b2bTier || 'NONE'"
                  class="w-full px-2 py-1 text-sm border border-purple-200 rounded"
                  @change="vendor.b2bData = vendor.b2bData || {}; vendor.b2bData.b2bTier = $event.target.value"
                >
                  <option value="NONE">
                    Seviye Yok
                  </option>
                  <option value="PARTNER">
                    Standart Ortak
                  </option>
                  <option value="PRIME_PARTNER">
                    Prime Ortak
                  </option>
                  <option value="ELITE_PARTNER">
                    Elite Ortak
                  </option>
                  <option value="APEX_PARTNER">
                    Apex Ortak
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-700 mb-1">Kurumsal Kod (Opsiyonel)</label>
                <input
                  type="text"
                  :value="vendor.b2bData?.corporateCode || ''"
                  placeholder="örn: SARAR-001"
                  class="w-full px-2 py-1 text-sm border border-purple-200 rounded"
                  @input="vendor.b2bData = vendor.b2bData || {}; vendor.b2bData.corporateCode = $event.target.value"
                >
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-700 mb-1">Özel Takas Limiti (Override)</label>
                <input
                  type="number"
                  :value="vendor.b2bData?.barterLimitOverride || 0"
                  class="w-full px-2 py-1 text-sm border border-purple-200 rounded"
                  placeholder="₺0.00"
                  @input="vendor.b2bData = vendor.b2bData || {}; vendor.b2bData.barterLimitOverride = Number($event.target.value)"
                >
              </div>
              <div>
                <label class="block text-xs font-semibold text-purple-700 mb-1">Özel Komisyon Oranı (%)</label>
                <input
                  type="number"
                  step="0.1"
                  :value="vendor.b2bData?.b2bCommRate || 10"
                  class="w-full px-2 py-1 text-sm border border-purple-200 rounded"
                  placeholder="%10"
                  @input="vendor.b2bData = vendor.b2bData || {}; vendor.b2bData.b2bCommRate = Number($event.target.value)"
                >
              </div>
              <div class="flex items-end">
                <button
                  class="w-full bg-purple-600 text-white py-1.5 rounded text-sm font-bold hover:bg-purple-700"
                  @click="$emit('save-b2b', vendor)"
                >
                  Ayarları Kaydet
                </button>
              </div>
            </div>
          </div>

          <!-- Öne Çıkarılan Satıcı Ayarı (Onaylılar İçin) -->
          <div
            v-if="vendor.status === 'APPROVED'"
            class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-blue-900">
                  🌟 Öne Çıkarılan Mağaza
                </h3>
                <p class="text-xs text-blue-700">
                  Bu mağaza ana sayfadaki "Öne Çıkan Satıcılar" bölümünde gösterilir.
                </p>
              </div>
              <button
                :class="[
                  'px-4 py-2 rounded-lg font-bold transition-all shadow-sm',
                  vendor.profile?.isFeatured
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                ]"
                @click="$emit('toggle-featured', vendor)"
              >
                {{ vendor.profile?.isFeatured ? 'Özelliği Kaldır' : 'Öne Çıkar' }}
              </button>
            </div>
          </div>

          <!-- Takas (Barter) Ayarı (Onaylılar İçin) -->
          <div
            v-if="vendor.status === 'APPROVED'"
            class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-bold text-emerald-900">
                  🔄 Takas (Barter) Modülü
                </h3>
                <p class="text-xs text-emerald-700">
                  Bu mağazanın diğer satıcılarla takas işlemi yapabilmesine izin verir.
                </p>
              </div>
              <button
                :class="[
                  'px-4 py-2 rounded-lg font-bold transition-all shadow-sm',
                  vendor.barterEnabled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50'
                ]"
                @click="$emit('toggle-barter', vendor)"
              >
                {{ vendor.barterEnabled ? 'Modülü Kapat' : 'Modülü Aç' }}
              </button>
            </div>
          </div>

          <!-- Hesap Durumu (Askıya Alma) -->
          <div
            v-if="vendor.status === 'APPROVED' || vendor.status === 'SUSPENDED'"
            class="bg-red-50 border border-red-200 rounded-lg p-4 mt-4"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-red-900">
                  ⚠️ Hesap Durumu
                </h3>
                <p class="text-xs text-red-700">
                  Satıcının hesabını geçici olarak askıya alabilir veya tekrar aktifleştirebilirsiniz.
                </p>
              </div>
              <div v-if="vendor.status === 'APPROVED'">
                <button
                  class="px-4 py-2 rounded-lg font-bold transition-all shadow-sm bg-red-600 text-white hover:bg-red-700"
                  @click="showSuspendForm = !showSuspendForm"
                >
                  Askıya Al
                </button>
              </div>
              <div v-if="vendor.status === 'SUSPENDED'">
                <button
                  class="px-4 py-2 rounded-lg font-bold transition-all shadow-sm bg-green-600 text-white hover:bg-green-700"
                  @click="$emit('reinstate', vendor.id)"
                >
                  Aktifleştir
                </button>
              </div>
            </div>

            <!-- Askıya Alma Formu -->
            <div v-if="showSuspendForm && vendor.status === 'APPROVED'" class="mt-4 bg-white border border-red-200 rounded-lg p-4">
              <label class="block text-sm font-medium text-red-700 mb-2">Askıya Alma Nedeni</label>
              <textarea 
                v-model="suspendReason"
                placeholder="Neden belirtiniz..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                rows="3"
              />
              <div class="flex gap-2 mt-4">
                <button
                  :disabled="actionLoading || !suspendReason"
                  class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                  @click="$emit('suspend', vendor.id, suspendReason); showSuspendForm = false; suspendReason = ''"
                >
                  {{ actionLoading ? 'İşleniyor...' : 'Askıya Al' }}
                </button>
                <button
                  class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                  @click="showSuspendForm = false; suspendReason = ''"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>

          <!-- Bilgiler -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold mb-2">
                İşletme Bilgileri
              </h3>
              <p class="text-sm text-gray-600 mb-1">
                <strong>Tür:</strong> {{ vendor.profile?.businessType || '-' }}
              </p>
              <p class="text-sm text-gray-600 mb-1">
                <strong>Kayıt No:</strong> {{
                  vendor.profile?.businessRegistration || '-' }}
              </p>
              <p class="text-sm text-gray-600 mb-1">
                <strong>Vergi ID:</strong> {{ vendor.company?.taxNumber || '-' }}
              </p>
              <p class="text-sm text-gray-600">
                <strong>Adres:</strong> {{ vendor.profile?.address || '-' }}, {{
                  vendor.profile?.city || '-' }}
              </p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">
                İletişim Bilgileri
              </h3>
              <p class="text-sm text-gray-600 mb-1">
                <strong>Yetkili:</strong> {{ vendor.user?.profile?.firstName }} {{ vendor.user?.profile?.lastName }}
              </p>
              <p class="text-sm text-gray-600 mb-1">
                <strong>E-posta:</strong> {{ vendor.user?.email || '-' }}
              </p>
              <p class="text-sm text-gray-600 mb-1">
                <strong>Telefon:</strong> {{ vendor.user?.profile?.phone || '-' }}
              </p>
              <p class="text-sm text-gray-600">
                <strong>Web:</strong> {{ vendor.profile?.website || '-' }}
              </p>
            </div>
          </div>

          <!-- Banka Bilgileri -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-semibold mb-3">
              💳 Banka Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-600">
                  <strong>Banka:</strong> {{ vendor.profile?.bankName || '-' }}
                </p>
                <p class="text-gray-600">
                  <strong>Hesap Sahibi:</strong> {{ vendor.profile?.bankAccountName || '-' }}
                </p>
              </div>
              <div>
                <p class="text-gray-600">
                  <strong>IBAN:</strong>
                </p>
                <p class="font-mono text-xs break-all">
                  {{ vendor.profile?.bankIban || '-' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Kategoriler -->
          <div>
            <h3 class="font-semibold mb-3">
              Kategoriler
            </h3>
            <div class="space-y-2 mb-4">
              <div
                v-for="cat in vendor.vendorCategories"
                :key="cat.id"
                class="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <span>{{ cat.category?.name || 'Bilinmeyen' }}</span>
                <button
                  class="text-red-600 hover:text-red-700 text-sm font-semibold"
                  @click="$emit('remove-category', vendor.id, cat.id)"
                >
                  Kaldır
                </button>
              </div>
            </div>

            <div class="flex gap-2">
              <select 
                :value="selectedCategoryId"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                @change="$emit('update:selectedCategoryId', $event.target.value)"
              >
                <option value="">
                  Kategori ekle...
                </option>
                <option
                  v-for="cat in availableCategories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
              <button
                :disabled="!selectedCategoryId"
                class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                @click="$emit('add-category', vendor.id)"
              >
                Ekle
              </button>
            </div>
          </div>

          <!-- İstatistikler -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <p class="text-2xl font-bold text-blue-600">
                {{ vendor._count?.listings || 0 }}
              </p>
              <p class="text-sm text-gray-600">
                İlan
              </p>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
              <p class="text-2xl font-bold text-green-600">
                ₺{{ (Number(vendor.stats?.totalSales) || 0).toFixed(2) }}
              </p>
              <p class="text-sm text-gray-600">
                Toplam Satış
              </p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center">
              <p class="text-2xl font-bold text-yellow-600">
                ⭐ {{ (Number(vendor.stats?.averageRating) || 0).toFixed(1) }}
              </p>
              <p class="text-sm text-gray-600">
                Puan
              </p>
            </div>
          </div>

          <!-- Kayıt Tarihi -->
          <div class="border-t pt-4 text-sm text-gray-600">
            <p><strong>Kaydı Yapan:</strong> {{ formatDate(vendor.createdAt) }}</p>
            <p
              v-if="vendor.verifiedAt"
              class="mt-1"
            >
              <strong>Onaylandı:</strong> {{ formatDate(vendor.verifiedAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from '#imports'

const vendor = defineModel('vendor', { type: Object })

defineProps({
  availableCategories: {
    type: Array,
    default: () => []
  },
  selectedCategoryId: {
    type: [String, Number],
    default: ''
  },
  showRejectForm: {
    type: Boolean,
    default: false
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  actionLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'close', 'approve', 'reject', 'cancel-reject', 
  'update:showRejectForm', 'update:rejectionReason', 
  'save-b2b', 'toggle-featured', 'remove-category', 
  'update:selectedCategoryId', 'add-category', 'update-type',
  'toggle-barter', 'delete', 'suspend', 'reinstate'
])

const showSuspendForm = ref(false)
const suspendReason = ref('')

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR')
}
</script>
