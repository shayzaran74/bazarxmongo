<template>
  <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div class="md:flex md:items-center md:justify-between mb-8">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          XP Kuralları ve Kota Yönetimi
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Sistem genelinde dağıtılacak XP oranlarını ve satıcıların XP kullanım limitlerini (Watchtower) buradan yönetebilirsiniz.
        </p>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
        <button 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="openDistRuleModal()"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Yeni Dağıtım Kuralı
        </button>
      </div>
    </div>

    <!-- Hata ve Başarı Mesajları -->
    <div
      v-if="errorMsg"
      class="mb-4 bg-red-50 border-l-4 border-red-400 p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ errorMsg }}
          </p>
        </div>
      </div>
    </div>
    
    <div
      v-if="successMsg"
      class="mb-4 bg-green-50 border-l-4 border-green-400 p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">
            {{ successMsg }}
          </p>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div class="border-b border-gray-200 mb-6">
      <nav
        class="-mb-px flex space-x-8"
        aria-label="Tabs"
      >
        <button 
          :class="[activeTab === 'distribution' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
          @click="activeTab = 'distribution'"
        >
          XP Dağıtım Kuralları (Kazanım)
        </button>
        <button 
          :class="[activeTab === 'spending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
          @click="activeTab = 'spending'"
        >
          Watchtower Harcama Limitleri (Kullanım)
        </button>
      </nav>
    </div>

    <!-- TAB 1: DAĞITIM KURALLARI -->
    <div
      v-show="activeTab === 'distribution'"
      class="space-y-6"
    >
      <div
        v-if="loadingDistRules"
        class="py-4 text-center text-gray-500"
      >
        Kurallar yükleniyor...
      </div>
      
      <div
        v-else
        class="bg-white shadow overflow-hidden sm:rounded-md"
      >
        <ul
          role="list"
          class="divide-y divide-gray-200"
        >
          <li
            v-for="rule in distRules"
            :key="rule.id"
          >
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-indigo-600 truncate">
                  {{ rule.name }}
                </p>
                <div class="ml-2 flex-shrink-0 flex">
                  <span 
                    :class="[rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']"
                  >
                    {{ rule.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </div>
              </div>
              <div class="mt-2 sm:flex sm:justify-between">
                <div class="sm:flex sm:space-x-4">
                  <p class="flex items-center text-sm text-gray-500">
                    <svg
                      class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {{ rule.city || 'Ulusal (Tüm Şehirler)' }}
                  </p>
                  <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <svg
                      class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      />
                    </svg>
                    Seviye: {{ rule.tier || 'Tümü' }}
                  </p>
                  <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 font-medium">
                    Öncelik: <span class="badge ml-1">{{ rule.priority }}</span>
                  </p>
                </div>
                <!-- Yüzdeler (Grafik gibi) -->
                <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 space-x-2">
                  <div class="flex flex-col text-center">
                    <span class="text-xs text-gray-400">Komisyon</span>
                    <span class="font-bold text-gray-700">%{{ rule.commissionPct }}</span>
                  </div>
                  <div class="flex flex-col text-center">
                    <span class="text-xs text-gray-400">Reklam</span>
                    <span class="font-bold text-blue-600">%{{ rule.adPct }}</span>
                  </div>
                  <div class="flex flex-col text-center">
                    <span class="text-xs text-gray-400">Hizmet</span>
                    <span class="font-bold text-amber-600">%{{ rule.servicePct }}</span>
                  </div>
                </div>
              </div>
            </div>
          </li>
          
          <li
            v-if="distRules.length === 0"
            class="py-10 text-center text-gray-500"
          >
            Henüz hiç dağıtım kuralı oluşturulmadı.
          </li>
        </ul>
      </div>
    </div>

    <!-- TAB 2: HARCAMA LIMITLERI -->
    <div
      v-show="activeTab === 'spending'"
      class="space-y-6"
    >
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Buradaki modifikasyonlar, doğrudan <strong class="font-bold">SmartTransactionModal</strong>'daki kaydırıcının (slider) kilit noktasını ve Watchtower limitlerini etkiler. Dikkatli değiştiriniz!
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="loadingSpendingLimits"
        class="py-4 text-center text-gray-500"
      >
        Limitler yükleniyor...
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <!-- Tiers için Kartlar -->
        <div
          v-for="limit in spendingLimits"
          :key="limit.tier"
          class="bg-white overflow-hidden shadow rounded-lg border-t-4"
          :class="limit.tier === 'CORE' ? 'border-gray-400' : 'border-purple-500'"
        >
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ limit.tier }} Seviyesi
              </h3>
              <span 
                :class="[limit.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']"
              >
                {{ limit.isActive ? 'Aktif' : 'Pasif' }}
              </span>
            </div>
            <dl class="space-y-4">
              <div class="sm:flex sm:justify-between sm:items-center">
                <dt class="text-sm font-medium text-gray-500">
                  Max İşlem Xp Ödeme Limiti
                </dt>
                <dd class="mt-1 text-lg font-bold text-gray-900 sm:mt-0">
                  %{{ limit.maxXpPerTransactionPct }}
                </dd>
              </div>
              <div class="sm:flex sm:justify-between sm:items-center">
                <dt class="text-sm font-medium text-gray-500">
                  Aylık Hacim Hedefi (Boost)
                </dt>
                <dd class="mt-1 text-sm font-bold text-gray-900 sm:mt-0">
                  {{ limit.monthlyVolumeThreshold }} TL
                </dd>
              </div>
              <div class="sm:flex sm:justify-between sm:items-center">
                <dt class="text-sm font-medium text-gray-500">
                  Boosted Günlük Kota
                </dt>
                <dd class="mt-1 text-sm font-bold text-gray-900 sm:mt-0">
                  {{ limit.boostedDailyXpLimit }} XP
                </dd>
              </div>
            </dl>
          </div>
          <div class="bg-gray-50 px-4 py-4 sm:px-6">
            <button
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              @click="openEditLimitModal(limit)"
            >
              Bu limiti düzenle &rarr;
            </button>
          </div>
        </div>

        <!-- Add missing tier (e.g. if we have CORE and PRIME, and one is absent) -->
        <div class="bg-gray-50 overflow-hidden shadow rounded-lg border-t-4 border-dashed border-gray-300 flex items-center justify-center min-h-[200px]">
          <button
            class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            @click="openEditLimitModal({ tier: 'CORE', maxXpPerTransactionPct: 20, monthlyVolumeThreshold: 0, boostedDailyXpLimit: 0, isActive: true, isNew: true })"
          >
            + Yeni Limit Kuralı (Tier) Ekle
          </button>
        </div>
      </div>
    </div>


    <!-- MODAL: Dağıtım Kuralı Ekle -->
    <transition name="modal-fade">
      <div
        v-if="isDistRuleModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">
              XP Dağıtım Kuralı
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500"
              @click="isDistRuleModalOpen = false"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Kural Adı</label>
              <input
                v-model="distRuleForm.name"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Şehir (Ulusal ise boş bırakın)</label>
              <input
                v-model="distRuleForm.city"
                type="text"
                placeholder="Örn: Antalya"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Vendor Seviyesi</label>
              <select
                v-model="distRuleForm.tier"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">
                  Tümü
                </option>
                <option value="CORE">
                  CORE
                </option>
                <option value="PRIME">
                  PRIME
                </option>
              </select>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700">Komisyon %</label>
                <input
                  v-model.number="distRuleForm.commissionPct"
                  type="number"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700">Reklam %</label>
                <input
                  v-model.number="distRuleForm.adPct"
                  type="number"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700">Hizmet %</label>
                <input
                  v-model.number="distRuleForm.servicePct"
                  type="number"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Öncelik (Büyük numara önce vurur)</label>
              <input
                v-model.number="distRuleForm.priority"
                type="number"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>
            <div class="flex items-center">
              <input
                v-model="distRuleForm.isActive"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">Aktif Kural</label>
            </div>
            
            <p
              v-if="pctTotal !== 100"
              class="text-xs text-red-500 font-bold mt-2"
            >
              Yüzdelerin toplamı 100 olmalıdır! (Şu an: {{ pctTotal }})
            </p>
          </div>
          <div class="px-6 py-4 bg-gray-50 text-right sm:px-6 flex justify-end space-x-2">
            <button
              class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              @click="isDistRuleModalOpen = false"
            >
              İptal
            </button>
            <button
              :disabled="pctTotal !== 100 || isSaving"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              @click="saveDistRule"
            >
              {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </div>
        </div>
      </div>
    </transition>


    <!-- MODAL: Limit Kuralı Düzenle -->
    <transition name="modal-fade">
      <div
        v-if="isLimitModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-amber-50">
            <h3 class="text-lg font-medium text-amber-900">
              Watchtower Limiti Düzenle
            </h3>
            <button
              class="text-gray-400 hover:text-gray-500"
              @click="isLimitModalOpen = false"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Seviye (Tier)</label>
              <select
                v-model="limitForm.tier"
                :disabled="!limitForm.isNew"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="CORE">
                  CORE
                </option>
                <option value="PRIME">
                  PRIME
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Max İşlem Xp Kullanım Limiti (%)</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input
                  v-model.number="limitForm.maxXpPerTransactionPct"
                  type="number"
                  min="0"
                  max="100"
                  class="block w-full border-gray-300 text-gray-900 focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                  placeholder="Örn: 20"
                >
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Aylık Hacim Eşiği (Boost İçin)</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <input
                  v-model.number="limitForm.monthlyVolumeThreshold"
                  type="number"
                  class="block w-full border-gray-300 text-gray-900 focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                  placeholder="Örn: 100000"
                >
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">TL</span>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Boosted Günlük Xp Kotası</label>
              <input
                v-model.number="limitForm.boostedDailyXpLimit"
                type="number"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
            </div>
            
            <div class="flex items-center">
              <input
                v-model="limitForm.isActive"
                type="checkbox"
                class="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">Aktif Limit</label>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 text-right sm:px-6 flex justify-end space-x-2">
            <button
              class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              @click="isLimitModalOpen = false"
            >
              İptal
            </button>
            <button
              :disabled="isSaving"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              @click="saveSpendingLimit"
            >
              {{ isSaving ? 'Kaydediliyor...' : 'Limitleri Uygula' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useAdminRulesService } from '~/services/api/AdminRulesService'
import { ref, computed, onMounted } from 'vue';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'] // Ensure admin auth is present
});

const activeTab = ref('distribution');
const errorMsg = ref('');
const successMsg = ref('');

const adminRulesService = useAdminRulesService()

// --- TAB 1: DISTRIBUTION RULES ---
const distRules = ref([]);
const loadingDistRules = ref(true);

const isDistRuleModalOpen = ref(false);
const isSaving = ref(false);

const distRuleForm = ref({
  name: '',
  city: '',
  tier: '',
  commissionPct: 25,
  adPct: 25,
  servicePct: 50,
  priority: 0,
  isActive: true
});

const pctTotal = computed(() => {
  return Number(distRuleForm.value.commissionPct) + Number(distRuleForm.value.adPct) + Number(distRuleForm.value.servicePct);
});

const fetchDistRules = async () => {
  loadingDistRules.value = true;
  try {
    const response = await adminRulesService.getXpDistributionRules();
    if (response.success) {
      distRules.value = response.data;
    }
  } catch (error) {
    errorMsg.value = 'Dağıtım kuralları çekilirken hata oluştu: ' + (error.data?.error || error.message);
  } finally {
    loadingDistRules.value = false;
  }
};

const openDistRuleModal = () => {
  distRuleForm.value = {
    name: '',
    city: '',
    tier: '',
    commissionPct: 25,
    adPct: 25,
    servicePct: 50,
    priority: 0,
    isActive: true
  };
  isDistRuleModalOpen.value = true;
};

const saveDistRule = async () => {
  isSaving.value = true;
  errorMsg.value = '';
  try {
    const payload = { ...distRuleForm.value };
    if (!payload.city) delete payload.city;
    if (!payload.tier) delete payload.tier;
    
    const response = await adminRulesService.saveXpDistributionRule(payload);
    
    if (response.success) {
      successMsg.value = 'Dağıtım kuralı başarıyla eklendi!';
      isDistRuleModalOpen.value = false;
      await fetchDistRules(); // Refresh
      setTimeout(() => { successMsg.value = ''; }, 3000);
    }
  } catch (error) {
    errorMsg.value = 'Kaydetme Hatası: ' + (error.data?.error || error.message);
  } finally {
    isSaving.value = false;
  }
};


// --- TAB 2: SPENDING LIMITS ---
const spendingLimits = ref([]);
const loadingSpendingLimits = ref(true);

const isLimitModalOpen = ref(false);
const limitForm = ref({
  tier: 'CORE',
  maxXpPerTransactionPct: 20,
  monthlyVolumeThreshold: 0,
  boostedDailyXpLimit: 0,
  isActive: true,
  isNew: false
});

const fetchSpendingLimits = async () => {
  loadingSpendingLimits.value = true;
  try {
    const response = await adminRulesService.getSpendingLimitRules();
    if (response.success) {
      spendingLimits.value = response.data;
    }
  } catch (error) {
    errorMsg.value = 'Limitler çekilirken hata oluştu: ' + (error.data?.error || error.message);
  } finally {
    loadingSpendingLimits.value = false;
  }
};

const openEditLimitModal = (limit) => {
  limitForm.value = { 
    ...limit, 
    maxXpPerTransactionPct: Number(limit.maxXpPerTransactionPct),
    monthlyVolumeThreshold: Number(limit.monthlyVolumeThreshold),
    boostedDailyXpLimit: Number(limit.boostedDailyXpLimit)
  };
  isLimitModalOpen.value = true;
};

const saveSpendingLimit = async () => {
  isSaving.value = true;
  errorMsg.value = '';
  try {
    
    const response = await adminRulesService.saveSpendingLimitRule(limitForm.value.tier, limitForm.value);
    
    if (response.success) {
      successMsg.value = 'Watchtower limitleri güncellendi (Sisteme yansıtıldı)!';
      isLimitModalOpen.value = false;
      await fetchSpendingLimits(); // Refresh
      setTimeout(() => { successMsg.value = ''; }, 4000);
    }
  } catch (error) {
    errorMsg.value = 'Limit Kaydetme Hatası: ' + (error.data?.error || error.message);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  fetchDistRules();
  fetchSpendingLimits();
});

</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.badge {
  @apply inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800;
}
</style>
