import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('AKTİF');

  const { data: response, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('orders');
      return res.data;
    }
  });

  const orders = response?.data || response || [];
  
  // Status mapping
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Beklemede', color: '#FBBF24' };
      case 'PAID': return { label: 'Ödendi', color: '#22C55E' };
      case 'SHIPPED': return { label: 'Kargoda', color: '#3B82F6' };
      case 'DELIVERED': return { label: 'Teslim Edildi', color: '#22C55E' };
      case 'CANCELLED': return { label: 'İptal Edildi', color: '#EF4444' };
      default: return { label: status, color: '#475569' };
    }
  };

  const filteredOrders = orders.filter((o: any) => {
    if (activeTab === 'AKTİF') {
      return ['PENDING', 'PAID', 'SHIPPED'].includes(o.status);
    }
    return ['DELIVERED', 'CANCELLED'].includes(o.status);
  });

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-4">
          <TouchableOpacity 
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
            onPress={() => router.back()}
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-black text-white">Siparişlerim</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-6 flex-row mb-6">
        {['AKTİF', 'GEÇMİŞ'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`mr-4 pb-2 border-b-2 ${activeTab === tab ? 'border-accent' : 'border-transparent'}`}
          >
            <Text className={`font-bold text-xs uppercase tracking-widest ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}>
              {tab} SİPARİŞLER
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-6">
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : (
          <View className="space-y-4">
            {filteredOrders.map((order: any) => {
              const status = getStatusInfo(order.status);
              return (
                <TouchableOpacity 
                  key={order.id}
                  onPress={() => router.push(`/orders/${order.id}`)}
                  className="bg-surface p-5 rounded-3xl mb-4 border border-white/5"
                >
                  <View className="flex-row justify-between items-start mb-4 pb-4 border-b border-white/5">
                    <View>
                      <Text className="text-white font-bold text-xs mb-1" numberOfLines={1}>#{order.orderNumber || order.id.slice(0, 8)}</Text>
                      <Text className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                    <Text className="text-white font-black text-lg">₺{parseFloat(order.totalAmount || 0).toLocaleString('tr-TR')}</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                      <Text style={{ color: status.color }} className="text-[10px] font-black uppercase tracking-widest">{status.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#475569" />
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredOrders.length === 0 && (
              <View className="py-20 items-center justify-center">
                <Ionicons name="receipt-outline" size={40} color="#475569" />
                <Text className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-widest">Siparişiniz bulunmuyor.</Text>
              </View>
            )}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
