import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function SwapSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [shippingCode, setShippingCode] = useState('');

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['swap-session', id],
    queryFn: async () => {
      const res = await api.get(`barter/swap/${id}`);
      return res.data;
    }
  });

  const updateShippingMutation = useMutation({
    mutationFn: (code: string) => api.post(`barter/swap/${id}/ship`, { shippingCode: code }),
    onSuccess: () => {
      Alert.alert('Başarılı', 'Kargo bilgisi güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['swap-session', id] });
    },
    onError: (err: any) => Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.')
  });

  const confirmReceiptMutation = useMutation({
    mutationFn: () => api.post(`barter/swap/${id}/confirm-receipt`),
    onSuccess: () => {
      Alert.alert('Başarılı', 'Teslimat onaylandı!');
      queryClient.invalidateQueries({ queryKey: ['swap-session', id] });
    }
  });

  const session = response?.data || response;

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  if (error || !session) {
    return (
      <View className="flex-1 bg-dark items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-white font-bold text-center mt-4">Takas oturumu bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-surface px-8 py-3 rounded-2xl">
          <Text className="text-white font-bold">Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStepStatus = (stepIndex: number) => {
    const statuses = ['PENDING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
    const currentStatusIndex = statuses.indexOf(session.status);
    if (currentStatusIndex > stepIndex) return 'completed';
    if (currentStatusIndex === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white">Takas Oturumu</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center border border-red-500/20">
           <Ionicons name="warning-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Status Timeline */}
        <View className="flex-row justify-between mb-10 px-2">
           {['Eşleşme', 'Kargo', 'Teslimat', 'Final'].map((label, idx) => {
              const status = getStepStatus(idx);
              return (
                <View key={label} className="items-center flex-1">
                   <View className={`w-8 h-8 rounded-full items-center justify-center mb-2 ${status === 'completed' ? 'bg-green-500' : status === 'current' ? 'bg-accent border-4 border-accent/30' : 'bg-surface border border-white/10'}`}>
                      {status === 'completed' ? <Ionicons name="checkmark" size={16} color="white" /> : <Text className="text-white text-[10px] font-black">{idx + 1}</Text>}
                   </View>
                   <Text className={`text-[8px] font-black uppercase tracking-widest ${status === 'upcoming' ? 'text-slate-600' : 'text-white'}`}>{label}</Text>
                </View>
              );
           })}
        </View>

        {/* Partners Info */}
        <View className="bg-surface p-6 rounded-3xl border border-white/5 mb-8">
           <View className="flex-row justify-between items-center">
              <View className="items-center flex-1">
                 <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mb-2 border border-white/10">
                    <Text className="text-primary font-black">{session.initiator?.name?.charAt(0) || 'S'}</Text>
                 </View>
                 <Text className="text-white font-bold text-[10px]" numberOfLines={1}>{session.initiator?.name || 'Siz'}</Text>
              </View>
              <Ionicons name="swap-horizontal" size={24} color="#3B82F6" className="mx-4" />
              <View className="items-center flex-1">
                 <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mb-2 border border-white/10">
                    <Text className="text-purple-500 font-black">{session.receiver?.name?.charAt(0) || 'A'}</Text>
                 </View>
                 <Text className="text-white font-bold text-[10px]" numberOfLines={1}>{session.receiver?.name || 'Alıcı'}</Text>
              </View>
           </View>
        </View>

        {/* Shipping Section */}
        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 ml-1">KARGO DURUMU</Text>
        <View className="bg-surface p-6 rounded-3xl border border-white/5 mb-8">
           {session.myShippingCode ? (
             <View>
                <View className="flex-row items-center mb-4">
                   <Ionicons name="cube-outline" size={24} color="#22C55E" />
                   <View className="ml-4">
                      <Text className="text-white font-bold text-sm">Kargoya Verildi</Text>
                      <Text className="text-slate-500 text-[10px] mt-1">Takip Kodu: {session.myShippingCode}</Text>
                   </View>
                </View>
                <TouchableOpacity className="bg-white/5 py-3 rounded-xl items-center border border-white/10">
                   <Text className="text-white font-bold text-xs">Kargoyu Takip Et</Text>
                </TouchableOpacity>
             </View>
           ) : (
             <View>
                <Text className="text-white font-bold text-sm mb-4">Kargo Bilgisi Girin</Text>
                <TextInput 
                   className="bg-dark/50 text-white px-5 py-4 rounded-2xl border border-white/5 font-bold mb-4"
                   placeholder="Kargo takip numaranız..."
                   placeholderTextColor="#475569"
                   value={shippingCode}
                   onChangeText={setShippingCode}
                />
                <TouchableOpacity 
                   onPress={() => updateShippingMutation.mutate(shippingCode)}
                   disabled={updateShippingMutation.isPending || !shippingCode}
                   className="bg-accent py-4 rounded-2xl items-center shadow-lg shadow-accent/20"
                >
                   {updateShippingMutation.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-xs uppercase tracking-widest">GÜNCELLE</Text>}
                </TouchableOpacity>
             </View>
           )}
        </View>

        {/* Receiver Shipping Status */}
        <View className="bg-surface/50 p-6 rounded-3xl border border-white/5 mb-8 opacity-60">
           <View className="flex-row items-center">
              <Ionicons name="airplane-outline" size={24} color="#94A3B8" />
              <View className="ml-4">
                 <Text className="text-slate-400 font-bold text-sm">Karşı Tarafın Kargo Bilgisi</Text>
                 <Text className="text-slate-600 text-[10px] mt-1">
                    {session.partnerShippingCode ? `Takip No: ${session.partnerShippingCode}` : 'Henüz bilgi girilmedi.'}
                 </Text>
              </View>
           </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Confirmation Bar */}
      {session.partnerShippingCode && !session.receiptConfirmed && (
        <View className="absolute bottom-0 w-full bg-surface border-t border-white/5 px-6 pt-4 pb-10">
           <TouchableOpacity 
             onPress={() => confirmReceiptMutation.mutate()}
             className="w-full h-14 bg-green-500 rounded-2xl items-center justify-center shadow-lg shadow-green-500/30 flex-row"
           >
             <Ionicons name="checkmark-circle-outline" size={20} color="white" />
             <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">ÜRÜNÜ TESLİM ALDIM</Text>
           </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
