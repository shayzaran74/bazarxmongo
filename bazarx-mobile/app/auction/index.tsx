import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuctions, type Auction } from '../../hooks/useAuction';

export default function AuctionListScreen() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useAuctions();

  const auctions: Auction[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const getRemaining = (endTime: string): string => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Süresi Doldu';
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    if (h > 24) return `${Math.floor(h / 24)}g ${h % 24}sa`;
    return `${h}sa ${m}dk`;
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Açık Artırma</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#3B82F6" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : auctions.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4 border border-white/5">
              <Ionicons name="hammer-outline" size={36} color="#475569" />
            </View>
            <Text className="text-slate-400 font-bold">Aktif açık artırma yok.</Text>
          </View>
        ) : (
          <View>
            {auctions.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => router.push(`/auction/${a.id}`)}
                className="bg-surface rounded-3xl mb-4 border border-white/5 overflow-hidden"
              >
                <View className="h-44 bg-slate-800 items-center justify-center">
                  {a.images?.[0] ? (
                    <Image source={{ uri: a.images[0] }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Ionicons name="hammer-outline" size={48} color="#334155" />
                  )}
                  <View className="absolute top-3 right-3 bg-red-500/20 px-3 py-1.5 rounded-full border border-red-500/30">
                    <Text className="text-red-400 text-[10px] font-black">⏱ {getRemaining(a.endTime)}</Text>
                  </View>
                </View>

                <View className="p-5">
                  <Text className="text-white font-black text-base mb-2" numberOfLines={1}>{a.title}</Text>
                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mevcut Teklif</Text>
                      <Text className="text-accent text-2xl font-black">
                        ₺{Number(a.currentBid || a.startingPrice).toLocaleString('tr-TR')}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teklif</Text>
                      <Text className="text-white font-black">{a.bidCount || 0}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
