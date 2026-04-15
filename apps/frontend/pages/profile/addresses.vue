<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <NuxtLink to="/profile" class="text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors flex items-center gap-2">
          <Icon name="heroicons:arrow-left" class="w-3 h-3" />
          Profile Dön
        </NuxtLink>
        <h1 class="text-4xl font-display font-black text-dark-950 italic tracking-tighter">Adreslerim</h1>
      </div>
      <button @click="showAddModal = true" class="px-6 py-3 bg-dark-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg active:scale-95 flex items-center gap-2">
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Yeni Adres Ekle
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !addresses.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="i in 2" :key="i" class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse">
        <div class="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
        <div class="h-6 bg-gray-100 rounded w-3/4 mb-8"></div>
        <div class="h-4 bg-gray-100 rounded w-full mb-2"></div>
        <div class="h-4 bg-gray-100 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!addresses.length" class="bg-gray-50 rounded-[3rem] p-12 lg:p-20 text-center border-2 border-dashed border-gray-200">
      <div class="max-w-sm mx-auto space-y-6">
        <Icon name="heroicons:map-pin" class="w-16 h-16 text-gray-300 mx-auto" />
        <h2 class="text-2xl font-display font-black text-dark-950 italic tracking-tighter">Henüz Bir Adres Yok</h2>
        <p class="text-gray-400 text-sm font-medium">Siparişleriniz için teslimat ve fatura adreslerinizi buradan yönetebilirsiniz.</p>
        <button @click="showAddModal = true" class="px-8 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl">
          İlk Adresini Ekle
        </button>
      </div>
    </div>

    <!-- Address List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="address in addresses" :key="address.id" class="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all">
        <div class="absolute top-8 right-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="editAddress(address)" class="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors">
            <Icon name="heroicons:pencil-square" class="w-4 h-4" />
          </button>
          <button @click="confirmDelete(address.id)" class="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {{ address.title }}
            </span>
            <span v-if="address.isDefault" class="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
              Varsayılan
            </span>
          </div>

          <div>
            <h3 class="text-xl font-display font-black text-dark-950 italic tracking-tighter">
              {{ address.firstName }} {{ address.lastName }}
            </h3>
            <p class="text-gray-400 text-sm font-medium mt-1">
              {{ address.addressLine1 }}<br />
              <span v-if="address.addressLine2">{{ address.addressLine2 }}<br /></span>
              {{ address.district }}, {{ address.city }}
            </p>
          </div>

          <div class="pt-4 border-t border-gray-50 flex items-center gap-4">
            <div class="flex items-center gap-2 text-xs font-bold text-gray-500">
              <Icon name="heroicons:phone" class="w-4 h-4" />
              {{ address.phone }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserAddress } from '~/types/identity';

const { addresses, loading, fetchAddresses, deleteAddress } = useIdentity();
const showAddModal = ref(false);

onMounted(() => {
  fetchAddresses();
});

const confirmDelete = async (id: string) => {
  if (confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
    const res = await deleteAddress(id);
    if (!res.success) {
      alert(res.message);
    }
  }
};

const editAddress = (address: UserAddress) => {
  // TODO: Modal implementation
};

definePageMeta({
  middleware: ['auth']
});
</script>
