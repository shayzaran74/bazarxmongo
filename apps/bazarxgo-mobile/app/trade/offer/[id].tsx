import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function ViewOfferScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['offer-detail', id],
    queryFn: async () => {
      const res = await api.get(`offers/${id}`);
      return res.data;
    }
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.post(`offers/${id}/accept`),
    onSuccess: () => {
      Alert.alert('Başarılı', 'Teklifi kabul ettiniz. Takas oturumu başlatıldı!', [
        { text: 'Takas Oturumuna Git', onPress: () => queryClient.invalidateQueries({ queryKey: ['offer-detail', id] }) }
      ]);
    },
    onError: (err: any) => Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.')
  });

  const offer = response?.data || response;

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  if (error || !offer) {
    return (
      <View className="flex-1 bg-dark items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-white font-bold text-center mt-4">Teklif bulunamadı veya yetkiniz yok.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-surface px-8 py-3 rounded-2xl">
          <Text className="text-white font-bold">Geri Dön</Text>
        </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Teklif Detayı</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Status Badge */}
        <View className="items-center mb-8">
           <View className="bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
             <Text className="text-accent font-black text-xs uppercase tracking-widest">{offer.status}</Text>
           </View>
        </View>

        <View className="flex-row justify-between items-center mb-8">
           <View className="flex-1 items-center">
             <View className="w-16 h-16 bg-slate-800 rounded-2xl items-center justify-center mb-2 overflow-hidden border border-white/5">
                {offer.fromCompany?.id && (
                  <Text className="text-white font-black text-xl">{offer.fromCompany.name.charAt(0)}</Text>
                )}
             </View>
             <Text className="text-white font-bold text-[10px] text-center" numberOfLines={1}>{offer.fromCompany?.name}</Text>
             <Text className="text-slate-500 text-[8px] font-black uppercase mt-1">TEKLİF EDEN</Text>
           </View>

           <View className="px-4">
             <Ionicons name="repeat" size={32} color="#3B82F6" />
           </View>

           <View className="flex-1 items-center">
             <View className="w-16 h-16 bg-slate-800 rounded-2xl items-center justify-center mb-2 overflow-hidden border border-white/5">
                {offer.toCompany?.id && (
                  <Text className="text-white font-black text-xl">{offer.toCompany.name.charAt(0)}</Text>
                )}
             </View>
             <Text className="text-white font-bold text-[10px] text-center" numberOfLines={1}>{offer.toCompany?.name}</Text>
             <Text className="text-slate-500 text-[8px] font-black uppercase mt-1">ALICI</Text>
           </View>
        </View>

        {/* Requested Items (What is being traded away) */}
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 ml-1">İSTENEN ÜRÜNLER</Text>
        <View className="space-y-3 mb-8">
          {offer.requestedItems?.map((item: any) => (
             <View key={item.id} className="bg-surface p-4 rounded-2xl border border-white/5 flex-row items-center">
                <View className="w-10 h-10 bg-dark rounded-xl items-center justify-center mr-3 overflow-hidden">
                   <Ionicons name="cube-outline" size={20} color="#475569" />
                </View>
                <View className="flex-1">
                   <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title || 'Ürün Detayı'}</Text>
                   <Text className="text-slate-500 text-[10px]">Değer: ₺{parseFloat(item.estimatedValue || 0).toLocaleString('tr-TR')}</Text>
                </View>
             </View>
          ))}
        </View>

        {/* Offered Items (What is being offered) */}
        <Text className="text-accent text-[10px] font-black uppercase tracking-widest mb-4 ml-1">TEKLİF EDİLENLER</Text>
        <View className="space-y-3 mb-8">
          {offer.offeredItems?.map((item: any) => (
             <View key={item.id} className="bg-accent/5 p-4 rounded-2xl border border-accent/10 flex-row items-center">
                <View className="w-10 h-10 bg-dark rounded-xl items-center justify-center mr-3 overflow-hidden">
                   <Ionicons name="gift-outline" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                   <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.title || 'Teklif Ürünü'}</Text>
                   <Text className="text-slate-500 text-[10px]">Değer: ₺{parseFloat(item.estimatedValue || 0).toLocaleString('tr-TR')}</Text>
                </View>
             </View>
          ))}
          {offer.cashAmount > 0 && (
            <View className="bg-green-500/5 p-4 rounded-2xl border border-green-500/10 flex-row items-center">
               <View className="w-10 h-10 bg-dark rounded-xl items-center justify-center mr-3">
                  <Ionicons name="cash-outline" size={20} color="#22C55E" />
               </View>
               <View className="flex-1">
                  <Text className="text-white font-bold text-xs">Nakit Desteği</Text>
                  <Text className="text-green-500 font-black text-sm">₺{parseFloat(offer.cashAmount).toLocaleString('tr-TR')}</Text>
               </View>
            </View>
          )}
        </View>

        {offer.message && (
          <View className="mb-8">
             <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">MESAJ</Text>
             <View className="bg-surface p-5 rounded-3xl border border-white/5">
                <Text className="text-slate-300 italic text-xs leading-relaxed">"{offer.message}"</Text>
             </View>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Action Bar (Only for Receiver and Pending status) */}
      {offer.status === 'PENDING' && (
        <View className="absolute bottom-0 w-full bg-surface border-t border-white/5 px-6 pt-4 pb-10 flex-row space-x-3">
           <TouchableOpacity 
             className="flex-1 h-14 bg-red-500/10 rounded-2xl items-center justify-center border border-red-500/20"
             onPress={() => Alert.alert('Onay', 'Bu teklifi reddetmek istediğinize emin misiniz?')}
           >
             <Text className="text-red-500 font-black text-xs uppercase tracking-widest">REDDET</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={() => acceptMutation.mutate()}
             disabled={acceptMutation.isPending}
             className="flex-1 h-14 bg-accent rounded-2xl items-center justify-center shadow-lg shadow-accent/30"
           >
             {acceptMutation.isPending ? <ActivityIndicator color="white" /> : (
               <Text className="text-white font-black text-xs uppercase tracking-widest">KABUL ET</Text>
             )}
           </TouchableOpacity>
        </View>
      )}

      {/* If Accepted, show Swap Link */}
      {offer.status === 'ACCEPTED' && offer.swapSession?.id && (
        <View className="absolute bottom-0 w-full bg-surface border-t border-white/5 px-6 pt-4 pb-10">
           <TouchableOpacity 
             onPress={() => router.push(`/trade/swap/${offer.swapSession.id}`)}
             className="w-full h-14 bg-green-500 rounded-2xl items-center justify-center shadow-lg shadow-green-500/30"
           >
             <Text className="text-white font-black text-xs uppercase tracking-widest">TAKAS OTURUMUNA GİT</Text>
           </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
