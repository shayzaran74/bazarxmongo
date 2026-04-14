<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Barter Havuzu Yönetimi
        </h1>
        <p class="text-sm text-gray-500">
          Kullanıcı bakiyelerini ve kredi limitlerini buradan yönetebilirsiniz.
        </p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <p class="text-xs font-bold uppercase opacity-80 tracking-widest mb-1">
            Toplam Sistem Havuzu
          </p>
          <h2 class="text-3xl font-black">
            {{ formatPoints(totalPool) }} Puan
          </h2>
        </div>
        <BanknotesIcon class="absolute right-[-10%] bottom-[-10%] h-32 w-32 opacity-10 rotate-12" />
      </div>
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
          Aktif Kullanıcı Sayısı
        </p>
        <h2 class="text-3xl font-black text-gray-900">
          {{ users.length }}
        </h2>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
          Toplam Kredi Tanımlı
        </p>
        <h2 class="text-3xl font-black text-gray-900">
          {{ formatPoints(totalLimits) }}
        </h2>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Kullanıcı ara..."
            class="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
          >
        </div>
        <button
          class="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          @click="fetchUsers"
        >
          <ArrowPathIcon class="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th class="px-6 py-4">
                Kullanıcı
              </th>
              <th class="px-6 py-4">
                Mevcut Bakiye
              </th>
              <th class="px-6 py-4">
                Kredi Limiti
              </th>
              <th class="px-6 py-4 text-right">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase"
                  >
                    {{ user.name?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900">
                      {{ user.name }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="text-sm font-black"
                  :class="Number(user.Wallet?.barterBalance) >= 0 ? 'text-green-600' : 'text-red-500'"
                >
                  {{ formatPoints(user.Wallet?.barterBalance || 0) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-black text-gray-700">
                  {{ formatPoints(user.Wallet?.barterCreditLimit || 0) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                  @click="editUserBarter(user)"
                >
                  DÜZENLE
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editingUser"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <h3 class="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
          Limit Düzenle
        </h3>
        <p class="text-sm text-gray-500 mb-8">
          {{ editingUser.name }} kullanıcısı için limitleri belirleyin.
        </p>

        <div class="space-y-6">
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Barter
              Bakiyesi</label>
            <input
              v-model="editForm.balance"
              type="number"
              class="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
            <p class="text-[9px] text-gray-400 mt-2 italic font-bold">
              Bakiyeyi doğrudan değiştirmek sistem
              dengesini bozabilir, dikkatli olun.
            </p>
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kredi
              Limiti</label>
            <input
              v-model="editForm.limit"
              type="number"
              class="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
            >
          </div>
        </div>

        <div class="flex gap-4 mt-10">
          <button
            class="flex-1 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
            @click="editingUser = null"
          >
            İptal
          </button>
          <button
            :disabled="saving"
            class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
            @click="saveBarterChanges"
          >
            {{ saving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    BanknotesIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const users = ref([])
const searchQuery = ref('')
const loading = ref(false)
const totalPool = ref(0)
const totalLimits = ref(0)

const fetchUsers = async () => {
    loading.value = true
    try {
        const res = await $api('/api/admin/barter/users')
        if (res.success) {
            users.value = res.data
            calculateStats()
        }
    } catch (err) {
        toast.error('Kullanıcı verileri yüklenemedi.')
    } finally {
        loading.value = false
    }
}

const calculateStats = () => {
    totalPool.value = users.value.reduce((acc, u) => acc + Number(u.Wallet?.barterBalance || 0), 0)
    totalLimits.value = users.value.reduce((acc, u) => acc + Number(u.Wallet?.barterCreditLimit || 0), 0)
}

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const term = searchQuery.value.toLowerCase()
    return users.value.filter(u =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    )
})

const editingUser = ref(null)
const saving = ref(false)
const editForm = ref({
    balance: 0,
    limit: 0
})

const editUserBarter = (user) => {
    editingUser.value = user
    editForm.value = {
        balance: Number(user.Wallet?.barterBalance || 0),
        limit: Number(user.Wallet?.barterCreditLimit || 0)
    }
}

const saveBarterChanges = async () => {
    saving.value = true
    try {
        const res = await $api(`/api/admin/barter/user/${editingUser.value.id}`, {
            method: 'PATCH',
            body: {
                barterBalance: editForm.value.balance,
                barterCreditLimit: editForm.value.limit
            }
        })
        if (res.success) {
            toast.success('Kullanıcı barter ayarları güncellendi.')
            editingUser.value = null
            fetchUsers()
        }
    } catch (err) {
        toast.error('Güncelleme sırasında bir hata oluştu.')
    } finally {
        saving.value = false
    }
}

const formatPoints = (val) => {
    return new Intl.NumberFormat('tr-TR').format(val)
}

onMounted(() => {
    fetchUsers()
})
</script>
