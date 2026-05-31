import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLotteries, type Lottery } from '../../hooks/useLottery';

export default function LotteryListScreen() {
  const router = useRouter();
  const { data, isLoading, isFetching, refetch } = useLotteries();

  const lotteries: Lottery[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Çekilişler</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#3B82F6" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : lotteries.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4 border border-white/5">
              <Ionicons name="ticket-outline" size={36} color="#475569" />
            </View>
            <Text className="text-slate-400 font-bold">Aktif çekiliş yok.</Text>
          </View>
        ) : (
          lotteries.map((l) => {
            const sold = l.soldTickets || 0;
            const pct = l.totalTickets > 0 ? Math.min(100, (sold / l.totalTickets) * 100) : 0;
            return (
              <TouchableOpacity
                key={l.id}
                onPress={() => router.push(`/lottery/${l.id}`)}
                className="bg-surface rounded-3xl mb-4 border border-white/5 overflow-hidden"
              >
                <View className="h-44 bg-slate-800 items-center justify-center">
                  {l.prizeImage ? (
                    <Image source={{ uri: l.prizeImage }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Ionicons name="trophy-outline" size={48} color="#FBBF24" />
                  )}
                  <View className="absolute top-3 right-3 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
                    <Text className="text-yellow-400 text-[10px] font-black">🎟 ÇEKİLİŞ</Text>
                  </View>
                </View>

                <View className="p-5">
                  <Text className="text-white font-black text-base mb-1" numberOfLines={1}>{l.title}</Text>
                  {l.prize && <Text className="text-yellow-400 text-xs font-bold mb-3">🏆 {l.prize}</Text>}

                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[9px] font-bold text-slate-400 uppercase">Bilet Fiyatı</Text>
                    <Text className="text-accent font-black">₺{Number(l.ticketPrice).toLocaleString('tr-TR')}</Text>
                  </View>

                  {/* Progress */}
                  <View className="mt-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-[9px] text-slate-400 font-bold">{sold}/{l.totalTickets} bilet</Text>
                      <Text className="text-[9px] text-slate-400 font-bold">%{pct.toFixed(0)}</Text>
                    </View>
                    <View className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <View className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
