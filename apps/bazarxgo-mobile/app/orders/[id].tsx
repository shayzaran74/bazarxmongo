import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: response, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const res = await api.get(`orders/${id}`);
      return res.data;
    }
  });

  const order = response?.data || response;

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Text className="text-white font-bold">Sipariş bulunamadı.</Text>
      </View>
    );
  }

  const steps = [
    { title: 'Sipariş Alındı', completed: true, date: new Date(order.createdAt).toLocaleString('tr-TR') },
    { title: 'Ödeme Onaylandı', completed: order.status !== 'PENDING' && order.status !== 'CANCELLED', date: order.paidAt ? new Date(order.paidAt).toLocaleString('tr-TR') : 'Tamamlandı' },
    { title: 'Hazırlanıyor', completed: ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status), date: order.status === 'PAID' ? 'Sıraya Alındı' : 'Tamamlandı' },
    { title: 'Kargoya Verildi', completed: ['SHIPPED', 'DELIVERED'].includes(order.status), date: order.status === 'SHIPPED' ? 'Yola Çıktı' : '-' },
    { title: 'Teslim Edildi', completed: order.status === 'DELIVERED', date: order.status === 'DELIVERED' ? 'Teslim Edildi' : 'Bekleniyor' },
  ];

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
          <View>
            <Text className="text-lg font-black text-white">#{order.orderNumber || order.id.slice(0, 8)}</Text>
            <Text className="text-xs text-slate-400">Sipariş Detayı</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        
        {/* Order Info Card */}
        <View className="bg-surface p-6 rounded-3xl border border-white/5 mb-8">
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-white/5">
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarih</Text>
              <Text className="text-white font-bold">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</Text>
            </View>
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Tutar</Text>
              <Text className="text-accent font-black">₺{parseFloat(order.totalAmount || 0).toLocaleString('tr-TR')}</Text>
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teslimat Adresi</Text>
            <Text className="text-white font-bold text-sm mb-1">{order.shippingAddress?.title || 'Teslimat Adresi'}</Text>
            <Text className="text-slate-400 text-xs">
              {order.shippingAddress?.addressLine1} {order.shippingAddress?.city} / {order.shippingAddress?.state}
            </Text>
          </View>
        </View>

        {/* Product Items */}
        <Text className="text-lg font-black text-white mb-4">Ürünler</Text>
        {order.orderItems?.map((item: any) => (
          <View key={item.id} className="bg-surface p-4 rounded-3xl border border-white/5 mb-4 flex-row items-center">
            <View className="w-16 h-16 bg-slate-800 rounded-2xl items-center justify-center mr-4 overflow-hidden">
               {item.productImages?.[0] ? (
                 <Image source={{ uri: item.productImages[0] }} className="w-full h-full" />
               ) : (
                 <Ionicons name="cube-outline" size={24} color="#334155" />
               )}
            </View>
            <View className="flex-1">
               <Text className="text-white font-bold text-sm mb-1">{item.productName}</Text>
               <Text className="text-slate-400 text-xs mb-1">Adet: {item.quantity}</Text>
               <Text className="text-accent font-black text-xs">₺{parseFloat(item.price || 0).toLocaleString('tr-TR')}</Text>
            </View>
          </View>
        ))}

        {/* Tracking Timeline */}
        <Text className="text-lg font-black text-white mb-4 mt-4">Kargo Takibi</Text>
        <View className="bg-surface p-6 rounded-3xl border border-white/5 mb-8">
          {steps.map((step, index) => (
            <View key={index} className="flex-row">
              <View className="items-center mr-4">
                <View className={`w-4 h-4 rounded-full ${step.completed ? 'bg-accent' : 'bg-slate-700'}`} />
                {index !== steps.length - 1 && (
                  <View className={`w-0.5 h-10 my-1 ${step.completed ? 'bg-accent/50' : 'bg-slate-700/50'}`} />
                )}
              </View>
              <View className="pb-6">
                <Text className={`font-bold ${step.completed ? 'text-white' : 'text-slate-500'}`}>{step.title}</Text>
                <Text className="text-[10px] text-slate-400 mt-1">{step.date}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity className="w-full py-5 border border-white/10 rounded-2xl items-center justify-center mb-10 bg-white/5">
          <Text className="text-white font-black text-xs uppercase tracking-widest">Faturayı İndir</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
