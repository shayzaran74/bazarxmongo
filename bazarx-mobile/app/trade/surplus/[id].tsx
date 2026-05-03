import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function SurplusDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [isFavorite, setIsFavorite] = useState(false);

  // Gerçek Takas (Surplus) ilan detayını API'den çekiyoruz
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['surplus-detail', id],
    queryFn: async () => {
      const res = await api.get(`/surplus/${id}`);
      return res.data;
    }
  });

  const item = response?.data || response?.item || response;

  const handleShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        message: `BazarX'te bu takas ilanına göz at: ${item.title || item.name} - Tahmini Değer: ₺${(item.price || item.estimatedValue || 0).toLocaleString('tr-TR')}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-white font-bold mt-4">İlan Detayı Yükleniyor...</Text>
      </View>
    );
  }

  if (error || !item) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
        <Text className="text-red-400 font-bold mt-4">İlan bulunamadı veya bir hata oluştu.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-surface px-6 py-3 rounded-full border border-white/5">
          <Text className="text-white font-bold">Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryName = item.category?.name || 'TAKAS İLANI';
  const vendorName = item.company?.name || item.vendor?.name || 'Gizli Satıcı';
  const estimatedValueStr = `₺${(item.price || item.estimatedValue || 0).toLocaleString('tr-TR')}`;

  return (
    <View className="flex-1 bg-dark">
      <ScrollView className="flex-1" bounces={false}>
        
        {/* Image Gallery */}
        <View className="w-full h-80 bg-slate-800 relative items-center justify-center">
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} className="w-full h-full absolute" resizeMode="cover" />
          ) : (
            <Ionicons name="cube-outline" size={80} color="#334155" />
          )}
          
          {/* Top Navigation */}
          <SafeAreaView className="absolute top-0 w-full px-6 flex-row justify-between pt-4">
            <TouchableOpacity 
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
              onPress={() => router.back()}
            >
              <Text className="text-white">←</Text>
            </TouchableOpacity>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons name={isFavorite ? "bookmark" : "bookmark-outline"} size={20} color={isFavorite ? "#3B82F6" : "white"} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View className="px-6 py-8">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row space-x-2">
              <View className="bg-accent/10 px-3 py-1.5 rounded-lg">
                <Text className="text-[10px] font-black text-accent uppercase tracking-widest">
                  {categoryName}
                </Text>
              </View>
              {item.condition && (
                <View className="bg-white/10 px-3 py-1.5 rounded-lg">
                  <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                    {item.condition}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Text className="text-2xl font-black text-white mb-2 leading-tight">
            {item.title || item.name}
          </Text>
          
          <View className="bg-primary/20 p-4 rounded-2xl mb-6 border border-accent/20 flex-row justify-between items-center">
            <View>
              <Text className="text-[10px] text-blue-200 uppercase font-black tracking-widest mb-1">Tahmini Takas Değeri</Text>
              <Text className="text-2xl font-black text-white">{estimatedValueStr}</Text>
            </View>
            <Ionicons name="repeat" size={32} color="#3B82F6" opacity={0.5} />
          </View>

          {/* Vendor Details */}
          <View className="flex-row items-center bg-surface p-4 rounded-2xl mb-8 border border-white/5">
            <View className="w-12 h-12 bg-[#001A30] rounded-full items-center justify-center border border-white/10">
              <Text className="text-white font-black">{vendorName.charAt(0)}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-bold">{vendorName}</Text>
              <Text className="text-[10px] text-slate-400 mt-1">Takas İlan Sahibi</Text>
            </View>
            <TouchableOpacity className="bg-white/5 px-3 py-2 rounded-lg">
              <Text className="text-white text-xs font-bold">Mesaj At</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-lg font-black text-white mb-3">İlan Açıklaması</Text>
          <Text className="text-slate-400 leading-relaxed text-sm mb-8">
            {item.description || 'Bu takas ilanı için detaylı açıklama girilmemiş.'}
          </Text>

          {/* Spacer for bottom bar */}
          <View className="h-24" /> 
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 w-full bg-surface border-t border-white/5 px-6 pt-4 pb-10 flex-row items-center justify-between">
        <TouchableOpacity 
          className="w-14 h-14 bg-white/5 rounded-2xl items-center justify-center border border-white/10 mr-4"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push(`/trade/offer/new/${item.id}`)}
          className="flex-1 h-14 bg-accent rounded-2xl items-center justify-center flex-row"
        >
          <Ionicons name="repeat-outline" size={20} color="white" />
          <Text className="text-white font-black text-sm uppercase tracking-widest ml-2">
            Takas Teklifi Yap
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
