import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdminDashboard } from '../../hooks/useAdmin';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { data, isLoading } = useAdminDashboard();

  const stats = data?.data || data || {};

  const MODULES = [
    { icon: 'people-outline',     label: 'Kullanıcılar', count: stats.totalUsers,       route: '/admin/users',    color: '#3B82F6' },
    { icon: 'storefront-outline', label: 'Satıcılar',    count: stats.totalVendors,     route: '/admin/vendors',  color: '#10B981', badge: stats.pendingVendors },
    { icon: 'cube-outline',       label: 'Ürünler',      count: stats.totalProducts,    route: '/admin/products', color: '#A855F7', badge: stats.pendingProducts },
    { icon: 'receipt-outline',    label: 'Siparişler',   count: stats.totalOrders,      route: '/admin/orders',   color: '#F59E0B' },
    { icon: 'hammer-outline',     label: 'Açık Artırma', count: stats.activeAuctions,   route: '/auction',        color: '#EC4899' },
    { icon: 'settings-outline',   label: 'Ayarlar',      count: null,                   route: '/admin/dashboard', color: '#94A3B8' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-[10px] font-black text-red-400 uppercase tracking-widest">YÖNETİM</Text>
            <Text className="text-xl font-black text-white">Admin Paneli</Text>
          </View>
          <View className="w-10" />
        </View>

        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : (
          <>
            {/* Bugünün Gelir — Hero */}
            <View className="px-6 mb-4">
              <View className="bg-surface p-6 rounded-3xl border border-red-500/30">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[10px] font-black text-red-400 uppercase tracking-widest">PLATFORM CİROSU (BUGÜN)</Text>
                  <Ionicons name="shield-checkmark" size={18} color="#EF4444" />
                </View>
                <Text className="text-white text-4xl font-black mb-1">
                  ₺{Number(stats.todayRevenue || 0).toLocaleString('tr-TR')}
                </Text>
                <Text className="text-slate-400 text-xs">
                  {stats.totalOrders || 0} toplam sipariş
                </Text>
              </View>
            </View>

            {/* Bekleyen İşler — Uyarı */}
            {(stats.pendingVendors > 0 || stats.pendingProducts > 0) && (
              <View className="px-6 mb-4">
                <View className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/30 flex-row items-center">
                  <Ionicons name="warning" size={20} color="#FBBF24" />
                  <View className="flex-1 ml-3">
                    <Text className="text-yellow-400 font-black text-sm">Bekleyen Onaylar</Text>
                    <Text className="text-slate-400 text-[10px] mt-0.5">
                      {stats.pendingVendors || 0} satıcı, {stats.pendingProducts || 0} ürün
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Modüller — 2x3 grid */}
            <View className="px-6">
              <Text className="text-white text-lg font-black mb-3">Yönetim Modülleri</Text>
              <View className="flex-row flex-wrap justify-between">
                {MODULES.map((m, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => router.push(m.route as any)}
                    className="bg-surface rounded-3xl p-5 mb-3 border border-white/5 relative"
                    style={{ width: '48%' }}
                  >
                    <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: m.color + '22' }}>
                      <Ionicons name={m.icon as any} size={20} color={m.color} />
                    </View>
                    <Text className="text-white font-black text-sm">{m.label}</Text>
                    {m.count !== null && m.count !== undefined && (
                      <Text className="text-slate-400 text-[10px] font-bold mt-1">
                        {m.count.toLocaleString('tr-TR')} kayıt
                      </Text>
                    )}
                    {m.badge !== undefined && m.badge !== null && m.badge > 0 && (
                      <View
                        className="absolute top-3 right-3 bg-red-500 rounded-full items-center justify-center"
                        style={{ minWidth: 20, height: 20, paddingHorizontal: 6 }}
                      >
                        <Text className="text-white text-[10px] font-black">{m.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
