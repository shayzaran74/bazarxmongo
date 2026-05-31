import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function MakeOfferScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedMyItems, setSelectedMyItems] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  // 1. Hedef Ürünü Çek (Karşı tarafın ilanı)
  const { data: targetRes, isLoading: targetLoading } = useQuery({
    queryKey: ['surplus-detail', id],
    queryFn: async () => {
      const res = await api.get(`surplus/${id}`);
      return res.data;
    }
  });

  // 2. Kendi İlanlarımı Çek (Teklif edebileceklerim)
  const { data: myItemsRes, isLoading: myItemsLoading } = useQuery({
    queryKey: ['my-surplus-items'],
    queryFn: async () => {
      const res = await api.get('surplus', { params: { type: 'my' } });
      return res.data;
    }
  });

  const targetItem = targetRes?.data || targetRes;
  const myItems = myItemsRes?.items || myItemsRes?.data || [];

  const toggleSelection = (itemId: string) => {
    if (selectedMyItems.includes(itemId)) {
      setSelectedMyItems(selectedMyItems.filter(i => i !== itemId));
    } else {
      setSelectedMyItems([...selectedMyItems, itemId]);
    }
  };

  const handleSendOffer = async () => {
    if (selectedMyItems.length === 0) {
      Alert.alert('Hata', 'Lütfen takas etmek için en az bir ürününüzü seçin.');
      return;
    }

    setSending(true);
    try {
      await api.post('offers', {
        targetItemId: id,
        offeredItemIds: selectedMyItems,
        note: 'Takas teklifimi ilettim.'
      });
      Alert.alert('Başarılı', 'Takas teklifiniz gönderildi.', [
        { text: 'Takas Kutusuna Git', onPress: () => router.push('/(tabs)/takas') }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Teklif gönderilirken bir hata oluştu.');
    } finally {
      setSending(false);
    }
  };

  if (targetLoading || myItemsLoading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Teklif Yap</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Target Item Summary */}
        <View className="bg-surface p-4 rounded-3xl border border-white/5 mb-8 flex-row items-center">
          <View className="w-16 h-16 bg-slate-800 rounded-2xl items-center justify-center mr-4 overflow-hidden">
             {targetItem?.images?.[0] ? (
               <Image source={{ uri: targetItem.images[0] }} className="w-full h-full" />
             ) : (
               <Ionicons name="cube-outline" size={24} color="#334155" />
             )}
          </View>
          <View className="flex-1">
             <Text className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">ALACAĞINIZ ÜRÜN</Text>
             <Text className="text-white font-bold text-sm mb-1">{targetItem?.title || targetItem?.name}</Text>
             <Text className="text-accent font-black text-xs">₺{parseFloat(targetItem?.price || 0).toLocaleString('tr-TR')}</Text>
          </View>
        </View>

        <Text className="text-lg font-black text-white mb-4">Takas Etmek İstediğiniz Ürünleriniz</Text>
        
        {myItems.length === 0 ? (
          <View className="bg-surface p-8 rounded-3xl border border-white/5 items-center">
             <Ionicons name="add-circle-outline" size={40} color="#475569" />
             <Text className="text-slate-400 text-center mt-4 mb-6">Henüz bir takas ilanınız bulunmuyor. Teklif verebilmek için önce bir ilan oluşturmalısınız.</Text>
             <TouchableOpacity 
               onPress={() => router.push('/trade/surplus/create')}
               className="bg-accent px-6 py-3 rounded-2xl"
             >
               <Text className="text-white font-bold">İlan Oluştur</Text>
             </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {myItems.map((item: any) => (
              <TouchableOpacity 
                key={item.id}
                onPress={() => toggleSelection(item.id)}
                className={`p-4 rounded-3xl border ${selectedMyItems.includes(item.id) ? 'bg-accent/10 border-accent' : 'bg-surface border-white/5'} flex-row items-center`}
              >
                <View className="w-14 h-14 bg-slate-800 rounded-2xl items-center justify-center mr-4 overflow-hidden">
                   {item.images?.[0] ? (
                     <Image source={{ uri: item.images[0] }} className="w-full h-full" />
                   ) : (
                     <Ionicons name="cube-outline" size={20} color="#334155" />
                   )}
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.title || item.name}</Text>
                  <Text className="text-slate-400 text-xs mt-1">₺{parseFloat(item.price || 0).toLocaleString('tr-TR')}</Text>
                </View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedMyItems.includes(item.id) ? 'bg-accent border-accent' : 'border-slate-700'}`}>
                   {selectedMyItems.includes(item.id) && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Bar */}
      {myItems.length > 0 && (
        <View className="absolute bottom-0 w-full bg-surface border-t border-white/5 px-6 pt-4 pb-10">
          <TouchableOpacity 
            onPress={handleSendOffer}
            disabled={sending}
            className="bg-accent w-full h-14 rounded-2xl items-center justify-center flex-row shadow-lg shadow-accent/30"
          >
            {sending ? <ActivityIndicator color="white" /> : (
              <>
                <Ionicons name="paper-plane-outline" size={20} color="white" />
                <Text className="text-white font-black text-sm uppercase tracking-widest ml-2">
                  Teklifi Gönder ({selectedMyItems.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
