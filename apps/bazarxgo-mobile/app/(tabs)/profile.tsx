import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function ProfileScreen() {
  const { logout } = useAuthStore();
  const router = useRouter();

  // Gerçek profil verisini çekiyoruz
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['profile-me'],
    queryFn: async () => {
      const response = await api.get('auth/me');
      return response.data;
    }
  });

  const user = profileResponse?.data || profileResponse || {};

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Çıkış Yap', 
        style: 'destructive',
        onPress: () => logout()
      }
    ]);
  };

    const menuItems = [
      { icon: 'time-outline', label: 'Siparişlerim', route: '/orders' },
      { icon: 'wallet-outline', label: 'Cüzdanım', route: '/wallet' },
      { icon: 'medal-outline', label: 'Rozetlerim', route: '/profile/badges' },
      { icon: 'gift-outline', label: 'Arkadaşını Davet Et', route: '/profile/referral' },
      { icon: 'hammer-outline', label: 'Açık Artırmalar', route: '/auction' },
      { icon: 'ticket-outline', label: 'Çekilişler', route: '/lottery' },
      { icon: 'add-circle-outline', label: 'Para Yükle', route: '/wallet/topup' },
      { icon: 'arrow-undo-outline', label: 'Para Çek', route: '/wallet/withdraw' },
      { icon: 'location-outline', label: 'Adreslerim', route: '/profile/addresses' },
      { icon: 'card-outline', label: 'Ödeme Yöntemleri', route: '/profile/payment' },
      { icon: 'shield-checkmark-outline', label: 'Güvenlik Ayarları', route: '/profile/security' },
      { icon: 'notifications-outline', label: 'Bildirimler', route: '/profile/notifications' },
      { icon: 'help-circle-outline', label: 'Yardım Merkezi', route: '/help' },
    ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mt-6 mb-8 flex-row items-center justify-between">
          <Text className="text-3xl font-black text-slate-800">Hesabım</Text>
          <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm">
            <Ionicons name="settings-outline" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <TouchableOpacity 
          onPress={() => router.push('/profile/edit')}
          className="bg-white p-6 rounded-3xl mb-8 border border-slate-100 shadow-sm flex-row items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="#F97316" className="mx-auto" />
          ) : (
            <>
              <View className="w-16 h-16 bg-[#F8FAFC] rounded-full items-center justify-center mr-4 border-2 border-orange-50">
                <Text className="text-xl font-black text-[#F97316]">
                  {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-slate-800 mb-1">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'BazarX Kullanıcısı'}
                </Text>
                <Text className="text-xs text-slate-500">
                  {user?.email || 'kullanici@email.com'}
                </Text>
                <View className="mt-2 flex-row">
                  <View className="bg-orange-100 px-2 py-1 rounded">
                    <Text className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                      {user?.role === 'VENDOR' ? 'TİCARİ SATICI' : 'STANDART'}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </>
          )}
        </TouchableOpacity>

        {/* Menu Items */}
        <View className="mb-8">
          
          {/* Admin / Vendor Paneli - Sadece yetkili kullanıcılara görünür */}
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.roles?.includes('ADMIN')) && (
            <TouchableOpacity
              onPress={() => router.push('/admin/dashboard')}
              className="flex-row items-center justify-between bg-red-50 p-5 rounded-2xl border border-red-100 mb-4 shadow-sm shadow-red-900/5"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-red-500/10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark-outline" size={16} color="#EF4444" />
                </View>
                <View>
                  <Text className="text-slate-800 font-bold">Admin Yönetim Paneli</Text>
                  <Text className="text-[10px] text-slate-500 mt-0.5">Kullanıcı, Satıcı ve Ürün Yönetimi</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}

          {user?.role === 'VENDOR' ? (
            <TouchableOpacity
              onPress={() => router.push('/vendor/dashboard')}
              className="flex-row items-center justify-between bg-yellow-50 p-5 rounded-2xl border border-yellow-100 mb-4 shadow-sm shadow-yellow-900/5"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-yellow-500/10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="storefront-outline" size={16} color="#D97706" />
                </View>
                <View>
                  <Text className="text-slate-800 font-bold">Mağaza / Satıcı Paneli</Text>
                  <Text className="text-[10px] text-slate-500 mt-0.5">İlan ve Sipariş Yönetimi</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D97706" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/vendor/apply')}
              className="flex-row items-center justify-between bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-4 shadow-sm shadow-blue-900/5"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-500/10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="add-circle-outline" size={16} color="#2563EB" />
                </View>
                <View>
                  <Text className="text-slate-800 font-bold">BazarX'te Satıcı Ol</Text>
                  <Text className="text-[10px] text-slate-500 mt-0.5">Mağazanı aç, milyonlara ulaş</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2563EB" />
            </TouchableOpacity>
          )}

          {/* Standart Menü */}
          <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {menuItems.map((item, i) => (
              <TouchableOpacity 
                key={i} 
                onPress={() => item.route ? router.push(item.route as any) : null}
                className={`flex-row items-center justify-between p-5 ${i !== menuItems.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-slate-50 rounded-lg items-center justify-center mr-3">
                    <Ionicons name={item.icon as any} size={18} color="#64748B" />
                  </View>
                  <Text className="text-slate-700 font-bold text-sm">{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={handleLogout}
          className="w-full py-5 border-2 border-red-100 rounded-2xl items-center justify-center mb-10 bg-white shadow-sm"
        >
          <Text className="text-red-500 font-black text-xs uppercase tracking-widest">
            Çıkış Yap
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
