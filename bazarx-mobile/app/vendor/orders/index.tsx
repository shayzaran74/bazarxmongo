import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVendorOrders, type VendorOrder } from '../../../hooks/useVendor';

const STATUS_TABS = [
  { key: 'ALL',        label: 'TÜMÜ' },
  { key: 'PENDING',    label: 'BEKLEYEN' },
  { key: 'PROCESSING', label: 'HAZIRLANIYOR' },
  { key: 'SHIPPED',    label: 'KARGODA' },
  { key: 'DELIVERED',  label: 'TESLİM' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING:    '#F59E0B',
  CONFIRMED:  '#3B82F6',
  PROCESSING: '#A855F7',
  SHIPPED:    '#06B6D4',
  DELIVERED:  '#10B981',
  CANCELLED:  '#EF4444',
};

export default function VendorOrdersScreen() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useVendorOrders();
  const [filter, setFilter] = useState('ALL');

  const allOrders: VendorOrder[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const orders = filter === 'ALL' ? allOrders : allOrders.filter(o => o.status === filter);

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Siparişler</Text>
        <View className="w-10" />
      </View>

      {/* Status Tab Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        className="mb-3"
      >
        {STATUS_TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-full border ${
              filter === t.key ? 'bg-accent border-accent' : 'bg-surface border-white/10'
            }`}
          >
            <Text className={`font-black text-[10px] tracking-widest ${
              filter === t.key ? 'text-white' : 'text-slate-400'
            }`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#3B82F6" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : orders.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4 border border-white/5">
              <Ionicons name="receipt-outline" size={36} color="#475569" />
            </View>
            <Text className="text-slate-400 font-bold">Bu kategoride sipariş yok.</Text>
          </View>
        ) : (
          orders.map((o) => (
            <TouchableOpacity
              key={o.id}
              onPress={() => router.push(`/vendor/orders/${o.id}`)}
              className="bg-surface rounded-3xl p-4 mb-3 border border-white/5"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-slate-400 text-[10px] font-bold uppercase">SİPARİŞ</Text>
                  <Text className="text-white font-black text-sm">#{o.orderNumber || o.id.substring(0, 8)}</Text>
                </View>
                <View className="px-2 py-1 rounded" style={{ backgroundColor: (STATUS_COLOR[o.status] || '#94A3B8') + '22' }}>
                  <Text style={{ color: STATUS_COLOR[o.status] || '#94A3B8' }} className="text-[9px] font-black">
                    {o.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-end pt-3 border-t border-white/5">
                <View>
                  <Text className="text-slate-400 text-[10px] font-bold mb-0.5">{o.customerName || 'Müşteri'}</Text>
                  <Text className="text-slate-500 text-[10px]">
                    {o.itemCount || 1} ürün · {new Date(o.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <Text className="text-accent font-black text-lg">
                  ₺{Number(o.totalAmount).toLocaleString('tr-TR')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
