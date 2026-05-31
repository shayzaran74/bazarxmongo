import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVendorDashboard } from '../../hooks/useVendor';

export default function VendorDashboardScreen() {
  const router = useRouter();
  const { data, isLoading } = useVendorDashboard();

  const stats = data?.data || data || {};

  const QUICK_ACTIONS = [
    { icon: 'cube-outline',         label: 'Ürünlerim',  route: '/vendor/products',   color: '#3B82F6' },
    { icon: 'receipt-outline',      label: 'Siparişler', route: '/vendor/orders',     color: '#10B981' },
    { icon: 'analytics-outline',    label: 'Analitik',   route: '/vendor/analytics',  color: '#A855F7' },
    { icon: 'add-circle-outline',   label: 'Ürün Ekle',  route: '/vendor/products/create', color: '#F59E0B' },
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
            <Text className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">SATICI PANELİ</Text>
            <Text className="text-xl font-black text-white">Mağazam</Text>
          </View>
          <View className="w-10" />
        </View>

        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : (
          <>
            {/* Bugünün Cirosu — Hero */}
            <View className="px-6 mb-4">
              <View className="bg-surface p-6 rounded-3xl border border-accent/30">
                <Text className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">BUGÜNÜN CİROSU</Text>
                <Text className="text-white text-4xl font-black mb-1">
                  ₺{Number(stats.todaySales || 0).toLocaleString('tr-TR')}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="trending-up" size={14} color="#10B981" />
                  <Text className="text-green-400 text-xs font-bold ml-1">
                    Aylık: ₺{Number(stats.monthlySales || 0).toLocaleString('tr-TR')}
                  </Text>
                </View>
              </View>
            </View>

            {/* İstatistikler */}
            <View className="px-6 mb-4 flex-row gap-3">
              <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
                <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
                <Text className="text-white text-2xl font-black mt-2">{stats.totalOrders || 0}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Toplam Sipariş</Text>
              </View>
              <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
                <Text className="text-yellow-400 text-2xl font-black mt-2">{stats.pendingOrders || 0}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Bekleyen</Text>
              </View>
            </View>

            <View className="px-6 mb-6 flex-row gap-3">
              <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
                <Ionicons name="cube-outline" size={20} color="#A855F7" />
                <Text className="text-white text-2xl font-black mt-2">{stats.activeProducts || 0}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Aktif Ürün</Text>
              </View>
              <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
                <Ionicons name="star-outline" size={20} color="#FBBF24" />
                <Text className="text-white text-2xl font-black mt-2">{stats.rating?.toFixed(1) || '—'}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Puan</Text>
              </View>
            </View>

            {/* Hızlı Aksiyonlar — 2x2 grid */}
            <View className="px-6">
              <Text className="text-white text-lg font-black mb-3">Hızlı İşlemler</Text>
              <View className="flex-row flex-wrap justify-between">
                {QUICK_ACTIONS.map((a, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => router.push(a.route as any)}
                    className="bg-surface rounded-3xl p-5 mb-3 border border-white/5 flex-row items-center"
                    style={{ width: '48%' }}
                  >
                    <View className="w-10 h-10 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: a.color + '22' }}>
                      <Ionicons name={a.icon as any} size={20} color={a.color} />
                    </View>
                    <Text className="text-white font-black text-sm flex-1">{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Trust Score */}
            {stats.trustScore !== undefined && (
              <View className="px-6 mb-6">
                <View className="bg-surface p-5 rounded-3xl border border-white/5">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-white font-black">Güven Skoru</Text>
                    <Text className="text-accent text-2xl font-black">{stats.trustScore}/100</Text>
                  </View>
                  <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <View className="h-full bg-accent" style={{ width: `${stats.trustScore}%` }} />
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
