import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVendorProducts, useDeleteVendorProduct, type VendorProduct } from '../../../hooks/useVendor';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: 'AKTİF',     color: '#10B981' },
  PASSIVE:  { label: 'PASİF',     color: '#94A3B8' },
  PENDING:  { label: 'BEKLEMEDE', color: '#F59E0B' },
  REJECTED: { label: 'REDDEDİLDİ', color: '#EF4444' },
};

export default function VendorProductsScreen() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useVendorProducts();
  const deleteProduct = useDeleteVendorProduct();
  const queryClient = useQueryClient();

  const products: VendorProduct[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Ürünü Sil', `"${title}" silinecek. Emin misiniz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          deleteProduct.mutate(id, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
              Alert.alert('Silindi', 'Ürün başarıyla kaldırıldı.');
            },
            onError: () => Alert.alert('Hata', 'Ürün silinemedi.'),
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Ürünlerim</Text>
        <TouchableOpacity
          onPress={() => router.push('/vendor/products/create')}
          className="w-10 h-10 bg-accent rounded-2xl items-center justify-center"
        >
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#3B82F6" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : products.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4 border border-white/5">
              <Ionicons name="cube-outline" size={36} color="#475569" />
            </View>
            <Text className="text-slate-400 font-bold mb-4">Henüz ürün eklemediniz.</Text>
            <TouchableOpacity
              onPress={() => router.push('/vendor/products/create')}
              className="bg-accent px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">İlk Ürünü Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((p) => {
            const status = STATUS_MAP[p.status] || STATUS_MAP.PASSIVE;
            return (
              <View key={p.id} className="bg-surface rounded-3xl p-4 mb-3 border border-white/5">
                <View className="flex-row">
                  <View className="w-20 h-20 bg-slate-800 rounded-2xl items-center justify-center mr-3 overflow-hidden">
                    {p.images?.[0] ? (
                      <Image source={{ uri: p.images[0] }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Ionicons name="image-outline" size={28} color="#334155" />
                    )}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-white font-black text-sm flex-1 mr-2" numberOfLines={2}>{p.title}</Text>
                      <View className="px-2 py-0.5 rounded" style={{ backgroundColor: status.color + '22' }}>
                        <Text style={{ color: status.color }} className="text-[8px] font-black">{status.label}</Text>
                      </View>
                    </View>
                    <Text className="text-slate-400 text-[10px] mb-2">
                      Stok: {p.stock} • Satılan: {p.soldCount || 0}
                    </Text>
                    <Text className="text-accent text-base font-black">
                      ₺{Number(p.price).toLocaleString('tr-TR')}
                    </Text>
                  </View>
                </View>

                {/* Aksiyonlar */}
                <View className="flex-row gap-2 mt-3 pt-3 border-t border-white/5">
                  <TouchableOpacity
                    onPress={() => router.push(`/vendor/products/${p.id}`)}
                    className="flex-1 bg-dark py-2.5 rounded-xl items-center border border-white/10 flex-row justify-center"
                  >
                    <Ionicons name="create-outline" size={14} color="#3B82F6" />
                    <Text className="text-accent font-bold text-xs ml-1.5">Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(p.id, p.title)}
                    className="flex-1 bg-red-500/10 py-2.5 rounded-xl items-center border border-red-500/20 flex-row justify-center"
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                    <Text className="text-red-400 font-bold text-xs ml-1.5">Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
