import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdminProducts, useApproveProduct } from '../../hooks/useAdmin';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_FILTERS = [
  { key: 'PENDING',  label: 'BEKLEYEN' },
  { key: 'ACTIVE',   label: 'AKTİF' },
  { key: 'PASSIVE',  label: 'PASİF' },
  { key: 'REJECTED', label: 'RED' },
];

export default function AdminProductsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('PENDING');

  const { data, isLoading, isFetching, refetch } = useAdminProducts(filter);
  const approve = useApproveProduct();

  const products: any[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const handleApprove = (p: any) => {
    Alert.alert('Ürünü Onayla', `"${p.title}" yayına alınacak.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Onayla',
        onPress: () => {
          approve.mutate(p.id, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
              queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
              Alert.alert('Onaylandı', 'Ürün yayına alındı.');
            },
            onError: () => Alert.alert('Hata', 'Onaylanamadı.'),
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Ürün Moderasyonu</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        className="mb-3"
      >
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setFilter(s.key)}
            className={`px-4 py-2 rounded-full border ${
              filter === s.key ? 'bg-accent border-accent' : 'bg-surface border-white/10'
            }`}
          >
            <Text className={`font-black text-[10px] tracking-widest ${
              filter === s.key ? 'text-white' : 'text-slate-400'
            }`}>
              {s.label}
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
        ) : products.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="cube-outline" size={36} color="#475569" />
            <Text className="text-slate-400 font-bold mt-4">Bu kategoride ürün yok.</Text>
          </View>
        ) : (
          products.map((p) => (
            <View key={p.id} className="bg-surface p-4 rounded-3xl mb-3 border border-white/5">
              <View className="flex-row mb-3">
                <View className="w-20 h-20 bg-slate-800 rounded-2xl items-center justify-center mr-3 overflow-hidden">
                  {p.images?.[0] ? (
                    <Image source={{ uri: p.images[0] }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={28} color="#334155" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-white font-black text-sm" numberOfLines={2}>{p.title}</Text>
                  <Text className="text-slate-400 text-[10px] mt-1">
                    {p.vendor?.companyName || p.vendor?.name || 'Satıcı'}
                  </Text>
                  <Text className="text-accent text-base font-black mt-2">
                    ₺{Number(p.price).toLocaleString('tr-TR')}
                  </Text>
                </View>
              </View>

              {filter === 'PENDING' && (
                <TouchableOpacity
                  onPress={() => handleApprove(p)}
                  className="bg-accent py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-black text-xs uppercase tracking-widest">ONAYLA & YAYINLA</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
