import type { UserProfile, UserAddress, UpdateProfileDto, CreateAddressDto, UpdateAddressDto, ChangePasswordDto } from '~/types/identity';
import type { ApiResponse } from '~/types/api';

export function useIdentity() {
  const { $api } = useApi();
  const profile = ref<UserProfile | null>(null);
  const addresses = ref<UserAddress[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** Profil bilgilerini getir */
  async function fetchProfile() {
    loading.value = true;
    error.value = null;
    try {
      const res = await $api<UserProfile>('identity/profile');
      if (res.success) {
        profile.value = res.data;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profil yüklenemedi';
      error.value = message;
    } finally {
      loading.value = false;
    }
  }

  /** Profil güncelle */
  async function updateProfile(dto: UpdateProfileDto) {
    loading.value = true;
    try {
      const res = await $api<UserProfile>('identity/profile', {
        method: 'PUT',
        body: dto
      });
      if (res.success) {
        profile.value = res.data;
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Profil güncellenemedi';
      loading.value = false;
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  }

  /** Adresleri getir */
  async function fetchAddresses() {
    loading.value = true;
    try {
      const res = await $api<UserAddress[]>('identity/addresses');
      if (res.success) {
        addresses.value = res.data;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Adresler yüklenemedi';
      error.value = message;
    } finally {
      loading.value = false;
    }
  }

  /** Yeni adres ekle */
  async function addAddress(dto: CreateAddressDto) {
    loading.value = true;
    try {
      const res = await $api<UserAddress>('identity/addresses', {
        method: 'POST',
        body: dto
      });
      if (res.success) {
        addresses.value.push(res.data);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Adres eklenemedi' };
    } finally {
      loading.value = false;
    }
  }

  /** Adres güncelle */
  async function updateAddress(id: string, dto: UpdateAddressDto) {
    loading.value = true;
    try {
      const res = await $api<UserAddress>(`identity/addresses/${id}`, {
        method: 'PUT',
        body: dto
      });
      if (res.success) {
        const index = addresses.value.findIndex(a => a.id === id);
        if (index !== -1) addresses.value[index] = res.data;
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Adres güncellenemedi' };
    } finally {
      loading.value = false;
    }
  }

  /** Adres sil */
  async function deleteAddress(id: string) {
    loading.value = true;
    try {
      const res = await $api<void>(`identity/addresses/${id}`, {
        method: 'DELETE'
      });
      if (res.success) {
        addresses.value = addresses.value.filter(a => a.id !== id);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Adres silinemedi' };
    } finally {
      loading.value = false;
    }
  }

  /** Şifre değiştir */
  async function changePassword(dto: ChangePasswordDto) {
    loading.value = true;
    try {
      const res = await $api<void>('profile/change-password', {
        method: 'POST',
        body: dto
      });
      return { success: res.success, message: res.message };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Şifre değiştirilemedi' };
    } finally {
      loading.value = false;
    }
  }

  return {
    profile,
    addresses,
    loading,
    error,
    fetchProfile,
    updateProfile,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    changePassword
  };
}
