<template>
  <div class="py-8">
    <h1 class="text-3xl font-black text-gray-900 uppercase tracking-tightest mb-8">
      FİRMA ONAY PANELİ
    </h1>

    <div class="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
      <div
        v-if="loading"
        class="p-8 text-center"
      >
        <div
          class="animate-spin h-8 w-8 border-4 border-gray-200 border-t-primary-600 rounded-full mx-auto mb-4"
        />
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
          Yükleniyor...
        </p>
      </div>

      <div
        v-else-if="!items || items?.length === 0"
        class="p-12 text-center"
      >
        <p class="text-gray-500 font-bold">
          Onay bekleyen firma bulunmuyor.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Firma
              </th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Vergi No
              </th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Konum
              </th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                Yetkili
              </th>
              <th
                class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
              >
                İşlem
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in items"
              :key="item.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500"
                  >
                    {{ item.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="font-bold text-gray-900 text-sm">
                        {{ item.name }}
                      </div>
                      <span v-if="item.isVendor" class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">SATICI</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ item.phone || '-' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-bold text-gray-700">
                {{ item.taxNumber || '-' }}
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 text-xs">
                  {{ item.city }}
                </div>
                <div class="text-[10px] text-gray-500">
                  {{ item.district }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-600">
                {{ item.users?.length > 0 && item.users[0]?.user ? item.users[0].user.name : '-' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    :disabled="processing === item.id"
                    class="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-200 transition-colors"
                    @click="approveCompany(item.id)"
                  >
                    {{ processing === item.id ? '...' : 'Onayla' }}
                  </button>
                  <button
                    :disabled="processing === item.id"
                    class="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-colors"
                    @click="rejectCompany(item.id)"
                  >
                    Reddet
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    // middleware: 'admin'
})

const { $api } = useApi()
const items = ref([])
const loading = ref(true)
const processing = ref(null)

const fetchPendingCompanies = async () => {
    loading.value = true
    try {
        const response = await $api('/api/companies/pending')
        if (response.success) {
            items.value = response.companies || []
        } else {
            items.value = []
        }
    } catch (error) {
        console.error('Fetch error:', error)
    } finally {
        loading.value = false
    }
}

const approveCompany = async (id) => {
    if (!confirm('Bu firmayı onaylamak istediğinize emin misiniz?')) return

    processing.value = id
    try {
        const response = await $api(`/api/companies/${id}/status`, {
            method: 'PATCH',
            body: { status: 'active' }
        })
        if (response.success) {
            useNuxtApp().$toast.success('Firma onaylandı.')
            items.value = items.value.filter(i => i.id !== id)
        }
    } catch (err) {
        console.error(err)
        useNuxtApp().$toast.error('İşlem başarısız.')
    } finally {
        processing.value = null
    }
}

const rejectCompany = async (id) => {
    if (!confirm('Bu firmayı reddetmek istediğinize emin misiniz?')) return

    processing.value = id
    try {
        const response = await $api(`/api/companies/${id}/status`, {
            method: 'PATCH',
            body: { status: 'rejected' }
        })
        if (response.success) {
            useNuxtApp().$toast.info('Firma reddedildi.')
            items.value = items.value.filter(i => i.id !== id)
        }
    } catch (err) {
        console.error(err)
        useNuxtApp().$toast.error('İşlem başarısız.')
    } finally {
        processing.value = null
    }
}

onMounted(() => {
    fetchPendingCompanies()
})
</script>
