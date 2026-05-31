import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdminOrders } from '../../hooks/useAdmin';

const STATUS_COLOR: Record<string, string> = {
  PENDING:    '#F59E0B',
  CONFIRMED:  '#3B82F6',
  PROCESSING: '#A855F7',
  SHIPPED:    '#06B6D4',
  DELIVERED:  '#10B981',
  CANCELLED:  '#EF4444',
};

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useAdminOrders();

  const orders: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Tüm Siparişler</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#3B82F6" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : orders.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="receipt-outline" size={36} color="#475569" />
            <Text className="text-slate-400 font-bold mt-4">Sipariş bulunmuyor.</Text>
          </View>
        ) : (
          orders.map((o) => (
            <View key={o.id} className="bg-surface p-4 rounded-3xl mb-3 border border-white/5">
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

              <View className="flex-row gap-3 pt-3 border-t border-white/5">
                <View className="flex-1">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase">Müşteri</Text>
                  <Text className="text-white text-xs font-bold mt-0.5" numberOfLines={1}>
                    {o.customerName || o.user?.email || '—'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase">Satıcı</Text>
                  <Text className="text-white text-xs font-bold mt-0.5" numberOfLines={1}>
                    {o.vendor?.companyName || '—'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase">Tutar</Text>
                  <Text className="text-accent font-black text-sm mt-0.5">
                    ₺{Number(o.totalAmount).toLocaleString('tr-TR')}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
