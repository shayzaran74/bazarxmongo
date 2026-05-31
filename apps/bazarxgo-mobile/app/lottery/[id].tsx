import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLotteryDetail, useBuyTicket } from '../../hooks/useLottery';
import { useQueryClient } from '@tanstack/react-query';

export default function LotteryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lotteryRes, isLoading } = useLotteryDetail(id);
  const buyTicket = useBuyTicket(id);

  const lottery = lotteryRes?.data || lotteryRes;
  const [quantity, setQuantity] = useState(1);

  const max = lottery?.maxTicketsPerUser || 5;
  const total = (lottery?.ticketPrice || 0) * quantity;

  const handleBuy = () => {
    Alert.alert(
      'Bilet Satın Al',
      `${quantity} bilet için ₺${total.toLocaleString('tr-TR')} cüzdanınızdan düşülecek. Onaylıyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            buyTicket.mutate(quantity, {
              onSuccess: () => {
                Alert.alert('🎟 Bilet Alındı!', `${quantity} bilet satın aldınız. Çekilişte bol şans!`);
                queryClient.invalidateQueries({ queryKey: ['lottery', id] });
                queryClient.invalidateQueries({ queryKey: ['lotteries'] });
              },
              onError: () => Alert.alert('Hata', 'Bilet alınamadı. Bakiye yetersiz veya kota dolmuş olabilir.'),
            });
          },
        },
      ]
    );
  };

  if (isLoading || !lottery) {
    return <SafeAreaView className="flex-1 bg-dark items-center justify-center"><ActivityIndicator color="#3B82F6" /></SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1">
        <View className="relative">
          <View className="h-72 bg-slate-800 items-center justify-center">
            {lottery.prizeImage ? (
              <Image source={{ uri: lottery.prizeImage }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Ionicons name="trophy-outline" size={80} color="#FBBF24" />
            )}
          </View>
          <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-2xl items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-6 py-6">
          <Text className="text-2xl font-black text-white mb-2">{lottery.title}</Text>
          {lottery.prize && (
            <View className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-2xl mb-4">
              <Text className="text-yellow-400 text-xs font-bold">🏆 ÖDÜL: {lottery.prize}</Text>
            </View>
          )}
          {lottery.description && (
            <Text className="text-slate-400 text-sm leading-relaxed mb-6">{lottery.description}</Text>
          )}

          {/* Bilet Sayısı */}
          <View className="bg-surface p-5 rounded-3xl mb-4 border border-white/5">
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bilet Sayısı</Text>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-dark rounded-2xl items-center justify-center border border-white/10"
              >
                <Ionicons name="remove" size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-3xl font-black">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(Math.min(max, quantity + 1))}
                className="w-12 h-12 bg-dark rounded-2xl items-center justify-center border border-white/10"
              >
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-slate-500 text-[10px] text-center mt-3">Maksimum: {max} bilet</Text>
          </View>

          {/* Toplam */}
          <View className="bg-surface p-5 rounded-3xl mb-4 border border-accent/30">
            <Text className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Toplam Tutar</Text>
            <Text className="text-white text-3xl font-black">₺{total.toLocaleString('tr-TR')}</Text>
          </View>

          <View className="h-24" />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/5">
        <TouchableOpacity
          onPress={handleBuy}
          disabled={buyTicket.isPending}
          className="bg-accent py-4 rounded-2xl items-center"
        >
          {buyTicket.isPending
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-black uppercase tracking-widest">Bilet Satın Al</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
