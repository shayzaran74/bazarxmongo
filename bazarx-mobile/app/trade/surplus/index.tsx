import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function SurplusListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Surplus (Takas İlanları) verisini çekiyoruz
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['surplus-items'],
    queryFn: async () => {
      const response = await api.get('surplus');
      return response.data;
    }
  });

  const surplusItems = data?.items || [];

  const filteredItems = surplusItems.filter((p: any) => 
    (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-3xl font-black text-white">Takas Havuzu</Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 bg-accent rounded-full items-center justify-center shadow-lg shadow-accent/30"
          onPress={() => router.push('/trade/surplus/create')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="w-full bg-surface rounded-2xl border border-white/5 flex-row items-center px-4">
          <Ionicons name="search" size={20} color="#475569" />
          <TextInput
            className="flex-1 text-white px-3 py-4 font-bold"
            placeholder="Ürün veya kategori ara..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Surplus Grid */}
      <ScrollView className="flex-1 px-6">
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-slate-400 mt-4 font-bold">Takas ilanları yükleniyor...</Text>
          </View>
        ) : error ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text className="text-red-400 mt-4 font-bold">İlanlar alınırken hata oluştu.</Text>
            <TouchableOpacity onPress={() => refetch()} className="mt-4 bg-white/5 px-4 py-2 rounded-xl">
              <Text className="text-white font-bold">Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {filteredItems.map((item: any) => (
              <TouchableOpacity 
                key={item.id}
                onPress={() => router.push(`/trade/surplus/${item.id}`)}
                className="bg-surface p-4 rounded-3xl border border-white/5 flex-row"
              >
                <View className="w-24 h-24 bg-slate-800 rounded-2xl items-center justify-center overflow-hidden mr-4">
                  {item.images && item.images.length > 0 ? (
                    <Image source={{ uri: item.images[0] }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Ionicons name="cube-outline" size={32} color="#334155" />
                  )}
                </View>
                <View className="flex-1 justify-center">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-1 rounded-md" numberOfLines={1}>
                      {item.category?.name || 'GENEL'}
                    </Text>
                    <Text className="text-[10px] font-bold text-slate-500">{item.condition === 'NEW' ? 'SIFIR' : 'İKİNCİ EL'}</Text>
                  </View>
                  <Text className="text-white font-black text-base mb-1" numberOfLines={2}>
                    {item.title || item.name}
                  </Text>
                  <Text className="text-slate-400 text-xs font-bold mb-2">
                    Tahmini: ₺{parseFloat(item.price || item.estimatedValue || 0).toLocaleString('tr-TR')}
                  </Text>
                  <View className="flex-row items-center mt-auto">
                     <View className="w-5 h-5 bg-primary/20 rounded-full items-center justify-center mr-2 border border-white/10">
                       <Text className="text-primary text-[8px] font-black">{(item.company?.name || item.vendor?.name || 'S').charAt(0)}</Text>
                     </View>
                     <Text className="text-slate-500 text-[10px] flex-1" numberOfLines={1}>
                       {item.company?.name || item.vendor?.name || 'Gizli Satıcı'}
                     </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {filteredItems.length === 0 && (
              <View className="py-20 items-center justify-center">
                <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4 border border-white/5">
                  <Ionicons name="repeat-outline" size={40} color="#475569" />
                </View>
                <Text className="text-slate-400 font-bold text-center">Aradığınız kriterde ilan bulunamadı.</Text>
              </View>
            )}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
