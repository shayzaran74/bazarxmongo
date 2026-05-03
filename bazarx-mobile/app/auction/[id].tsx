import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuctionDetail, useAuctionBids, useParticipate, usePlaceBid } from '../../hooks/useAuction';
import { useQueryClient } from '@tanstack/react-query';

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: auctionRes, isLoading } = useAuctionDetail(id);
  const { data: bidsRes } = useAuctionBids(id);
  const participate = useParticipate(id);
  const placeBid = usePlaceBid(id);

  const auction = auctionRes?.data || auctionRes;
  const bids = Array.isArray(bidsRes?.data) ? bidsRes.data : Array.isArray(bidsRes) ? bidsRes : [];

  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  const minBid = Number(auction?.currentBid || auction?.startingPrice || 0) + 1;

  const handleParticipate = () => {
    Alert.alert(
      'Katılım Teminatı',
      `₺${Number(auction?.participationDeposit || 0).toLocaleString('tr-TR')} cüzdanınızdan bloklanacak. Devam edilsin mi?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            participate.mutate(undefined, {
              onSuccess: () => {
                Alert.alert('Başarılı', 'Açık artırmaya katıldınız.');
                queryClient.invalidateQueries({ queryKey: ['auction', id] });
              },
              onError: () => Alert.alert('Hata', 'Katılım başarısız. Bakiye yetersiz olabilir.'),
            });
          },
        },
      ]
    );
  };

  const handleBid = () => {
    const amount = Number(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      Alert.alert('Geçersiz', `En az ₺${minBid.toLocaleString('tr-TR')} teklif vermelisiniz.`);
      return;
    }
    placeBid.mutate(amount, {
      onSuccess: () => {
        setShowBidModal(false);
        setBidAmount('');
        Alert.alert('Teklif Verildi!', `₺${amount.toLocaleString('tr-TR')} teklifiniz alındı.`);
        queryClient.invalidateQueries({ queryKey: ['auction', id] });
        queryClient.invalidateQueries({ queryKey: ['auction-bids', id] });
      },
      onError: () => Alert.alert('Hata', 'Teklif verilemedi. Önce katılmalısınız.'),
    });
  };

  if (isLoading || !auction) {
    return <SafeAreaView className="flex-1 bg-dark items-center justify-center"><ActivityIndicator color="#3B82F6" /></SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1">
        {/* Görsel + Geri */}
        <View className="relative">
          <View className="h-72 bg-slate-800 items-center justify-center">
            {auction.images?.[0] ? (
              <Image source={{ uri: auction.images[0] }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Ionicons name="hammer-outline" size={64} color="#334155" />
            )}
          </View>
          <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 w-10 h-10 bg-black/50 rounded-2xl items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="px-6 py-6">
          <Text className="text-2xl font-black text-white mb-2">{auction.title}</Text>
          {auction.description && (
            <Text className="text-slate-400 text-sm leading-relaxed mb-6">{auction.description}</Text>
          )}

          {/* Mevcut Teklif Kartı */}
          <View className="bg-surface p-5 rounded-3xl mb-4 border border-accent/30">
            <Text className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Mevcut En Yüksek Teklif</Text>
            <Text className="text-white text-4xl font-black mb-2">
              ₺{Number(auction.currentBid || auction.startingPrice).toLocaleString('tr-TR')}
            </Text>
            <Text className="text-slate-400 text-xs">{bids.length} teklif verildi</Text>
          </View>

          {/* Detaylar */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Başlangıç</Text>
              <Text className="text-white font-black">₺{Number(auction.startingPrice).toLocaleString('tr-TR')}</Text>
            </View>
            <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teminat</Text>
              <Text className="text-white font-black">₺{Number(auction.participationDeposit).toLocaleString('tr-TR')}</Text>
            </View>
          </View>

          {/* Son Teklifler */}
          <Text className="text-white font-black text-lg mb-3">Son Teklifler</Text>
          {bids.slice(0, 5).map((bid: any) => (
            <View key={bid.id} className="bg-surface p-4 rounded-2xl mb-2 flex-row justify-between items-center border border-white/5">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-accent/20 rounded-full items-center justify-center mr-3">
                  <Text className="text-accent text-[10px] font-black">{bid.userName?.charAt(0) || 'U'}</Text>
                </View>
                <Text className="text-white font-bold text-xs">{bid.userName || 'Anonim'}</Text>
              </View>
              <Text className="text-accent font-black">₺{Number(bid.amount).toLocaleString('tr-TR')}</Text>
            </View>
          ))}
          {bids.length === 0 && (
            <Text className="text-slate-500 text-xs text-center py-4">Henüz teklif yok.</Text>
          )}

          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Aksiyon Butonları */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/5 flex-row gap-3">
        <TouchableOpacity
          onPress={handleParticipate}
          disabled={participate.isPending}
          className="flex-1 bg-surface py-4 rounded-2xl items-center border border-white/10"
        >
          {participate.isPending
            ? <ActivityIndicator color="#3B82F6" />
            : <Text className="text-white font-black text-xs uppercase">KATIL</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowBidModal(true)}
          className="flex-1 bg-accent py-4 rounded-2xl items-center"
        >
          <Text className="text-white font-black text-xs uppercase">TEKLİF VER</Text>
        </TouchableOpacity>
      </View>

      {/* Teklif Modal */}
      <Modal visible={showBidModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-dark p-6 rounded-t-3xl">
            <View className="w-12 h-1 bg-slate-700 self-center rounded-full mb-6" />
            <Text className="text-white font-black text-xl mb-2">Teklif Ver</Text>
            <Text className="text-slate-400 text-xs mb-4">
              Minimum teklif: ₺{minBid.toLocaleString('tr-TR')}
            </Text>
            <TextInput
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              placeholder={`${minBid}`}
              placeholderTextColor="#475569"
              className="bg-surface text-white text-2xl font-black p-5 rounded-2xl border border-white/10 mb-4"
            />
            <TouchableOpacity
              onPress={handleBid}
              disabled={placeBid.isPending}
              className="bg-accent py-4 rounded-2xl items-center"
            >
              {placeBid.isPending
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-black uppercase tracking-widest">Teklifi Onayla</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowBidModal(false)} className="py-3 mt-2 items-center">
              <Text className="text-slate-400 font-bold text-xs">Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
