import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVendorOrderDetail, useUpdateOrderStatus } from '../../../hooks/useVendor';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_LABEL: Record<string, string> = {
  PENDING:    'Bekleyen',
  CONFIRMED:  'Onaylandı',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED:    'Kargoda',
  DELIVERED:  'Teslim Edildi',
  CANCELLED:  'İptal',
};

export default function VendorOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useVendorOrderDetail(id);
  const updateStatus = useUpdateOrderStatus(id);

  const order = data?.data || data;
  const items: any[] = order?.items || [];
  const currentIdx = STATUS_FLOW.indexOf(order?.status);

  const handleAdvance = () => {
    if (currentIdx < 0 || currentIdx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIdx + 1];
    Alert.alert(
      'Durum Güncelle',
      `Sipariş durumu "${STATUS_LABEL[nextStatus]}" olarak güncellenecek.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            updateStatus.mutate(nextStatus, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['vendor-order', id] });
                queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
                Alert.alert('Güncellendi', 'Müşteriye bildirim gönderildi.');
              },
              onError: () => Alert.alert('Hata', 'Durum güncellenemedi.'),
            });
          },
        },
      ]
    );
  };

  if (isLoading || !order) {
    return <SafeAreaView className="flex-1 bg-dark items-center justify-center"><ActivityIndicator color="#3B82F6" /></SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1">
        <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-white">Sipariş Detayı</Text>
          <View className="w-10" />
        </View>

        {/* Order Number + Status */}
        <View className="px-6 mb-4">
          <View className="bg-surface p-5 rounded-3xl border border-accent/30">
            <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">SİPARİŞ NUMARASI</Text>
            <Text className="text-white font-black text-lg mb-3">#{order.orderNumber || order.id.substring(0, 12)}</Text>

            {/* Status Stepper */}
            <View className="flex-row mt-2">
              {STATUS_FLOW.map((s, i) => (
                <View key={s} className="flex-1 items-center">
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${
                    i <= currentIdx ? 'bg-accent' : 'bg-slate-700'
                  }`}>
                    {i < currentIdx
                      ? <Ionicons name="checkmark" size={16} color="white" />
                      : <Text className="text-white text-[10px] font-black">{i + 1}</Text>}
                  </View>
                  <Text className={`text-[8px] font-bold text-center mt-1 ${
                    i <= currentIdx ? 'text-white' : 'text-slate-500'
                  }`}>
                    {STATUS_LABEL[s]?.toUpperCase().slice(0, 7)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Customer */}
        <View className="px-6 mb-4">
          <View className="bg-surface p-5 rounded-3xl border border-white/5">
            <Text className="text-slate-400 text-[10px] font-bold uppercase mb-2">MÜŞTERİ</Text>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                <Text className="text-accent font-black">{order.customerName?.charAt(0) || 'M'}</Text>
              </View>
              <View>
                <Text className="text-white font-black">{order.customerName || 'Müşteri'}</Text>
                <Text className="text-slate-400 text-xs">{order.customerEmail || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items */}
        <View className="px-6 mb-4">
          <Text className="text-white font-black mb-3">Ürünler ({items.length})</Text>
          {items.length === 0 ? (
            <View className="bg-surface p-4 rounded-2xl border border-white/5">
              <Text className="text-slate-500 text-xs text-center">Ürün bilgisi yok.</Text>
            </View>
          ) : (
            items.map((it: any, i: number) => (
              <View key={i} className="bg-surface p-4 rounded-2xl mb-2 flex-row items-center border border-white/5">
                <View className="w-12 h-12 bg-slate-800 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="cube-outline" size={20} color="#475569" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs" numberOfLines={1}>{it.title || 'Ürün'}</Text>
                  <Text className="text-slate-400 text-[10px] mt-1">{it.quantity} adet</Text>
                </View>
                <Text className="text-accent font-black text-xs">
                  ₺{Number(it.price * it.quantity).toLocaleString('tr-TR')}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Total */}
        <View className="px-6 mb-6">
          <View className="bg-surface p-5 rounded-3xl border border-white/5 flex-row justify-between items-center">
            <Text className="text-white font-black">TOPLAM</Text>
            <Text className="text-accent text-2xl font-black">
              ₺{Number(order.totalAmount).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Aksiyon Butonu */}
      {currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 && order.status !== 'CANCELLED' && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/5">
          <TouchableOpacity
            onPress={handleAdvance}
            disabled={updateStatus.isPending}
            className="bg-accent py-4 rounded-2xl items-center"
          >
            {updateStatus.isPending
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-black uppercase tracking-widest">
                  → {STATUS_LABEL[STATUS_FLOW[currentIdx + 1]].toUpperCase()}
                </Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
