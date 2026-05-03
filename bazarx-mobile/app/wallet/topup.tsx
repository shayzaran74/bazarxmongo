import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function TopUpScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CREDIT_CARD');

  const topUpMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/wallet/topup', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      Alert.alert('Başarılı', 'Bakiye yükleme talebiniz alındı.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.response?.data?.message || 'Yükleme başarısız oldu.');
    }
  });

  const handleTopUp = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir tutar girin.');
      return;
    }
    topUpMutation.mutate({ amount: numAmount, paymentMethod: method });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-8 flex-row items-center">
        <TouchableOpacity 
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
          onPress={() => router.back()}
        >
          <Text className="text-white">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Para Yükle</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="bg-surface p-6 rounded-3xl border border-white/5 mb-8">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Yüklemek İstediğiniz Tutar</Text>
          <View className="flex-row items-center border-b border-white/10 pb-2">
            <Text className="text-3xl font-black text-white mr-2">₺</Text>
            <TextInput
              className="flex-1 text-4xl font-black text-white"
              placeholder="0.00"
              placeholderTextColor="#1e293b"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        <Text className="text-lg font-black text-white mb-4">Ödeme Yöntemi</Text>
        <TouchableOpacity 
          onPress={() => setMethod('CREDIT_CARD')}
          className={`flex-row items-center p-5 rounded-2xl border mb-4 ${method === 'CREDIT_CARD' ? 'bg-accent/10 border-accent' : 'bg-surface border-white/5'}`}
        >
          <Ionicons name="card-outline" size={24} color={method === 'CREDIT_CARD' ? '#3B82F6' : '#64748b'} />
          <Text className={`font-bold ml-4 ${method === 'CREDIT_CARD' ? 'text-white' : 'text-slate-400'}`}>Kredi / Banka Kartı</Text>
          <View className="flex-1" />
          {method === 'CREDIT_CARD' && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setMethod('BANK_TRANSFER')}
          className={`flex-row items-center p-5 rounded-2xl border mb-8 ${method === 'BANK_TRANSFER' ? 'bg-accent/10 border-accent' : 'bg-surface border-white/5'}`}
        >
          <Ionicons name="business-outline" size={24} color={method === 'BANK_TRANSFER' ? '#3B82F6' : '#64748b'} />
          <Text className={`font-bold ml-4 ${method === 'BANK_TRANSFER' ? 'text-white' : 'text-slate-400'}`}>Havale / EFT</Text>
          <View className="flex-1" />
          {method === 'BANK_TRANSFER' && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleTopUp}
          disabled={topUpMutation.isPending}
          className={`w-full py-5 rounded-2xl items-center justify-center bg-accent shadow-xl shadow-accent/20`}
        >
          {topUpMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-black text-sm uppercase tracking-widest">Yüklemeyi Tamamla</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
