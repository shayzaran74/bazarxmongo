import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function WithdrawScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState('');
  const [iban, setIban] = useState('');
  const [holder, setHolder] = useState('');
  const [bank, setBank] = useState('');

  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/wallet/withdraw', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      Alert.alert('Başarılı', 'Para çekme talebiniz alındı. Kontroller sonrası hesabınıza aktarılacaktır.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.response?.data?.message || 'Para çekme talebi başarısız oldu.');
    }
  });

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir tutar girin.');
      return;
    }
    if (!iban || !holder) {
      Alert.alert('Uyarı', 'Lütfen IBAN ve Alıcı bilgilerini eksiksiz girin.');
      return;
    }
    withdrawMutation.mutate({ 
      amount: numAmount, 
      iban, 
      accountHolder: holder, 
      bankName: bank || 'Belirtilmemiş' 
    });
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
        <Text className="text-2xl font-black text-white">Para Çek</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="bg-surface p-6 rounded-3xl border border-white/5 mb-8">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Çekmek İstediğiniz Tutar</Text>
          <View className="flex-row items-center border-b border-white/10 pb-2">
            <Text className="text-3xl font-black text-white mr-2">₺</Text>
            <TextInput
              className="flex-1 text-4xl font-black text-white"
              placeholder="0.00"
              placeholderTextColor="#1e293b"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View className="space-y-4 mb-8">
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Alıcı Ad Soyad</Text>
            <TextInput
              className="w-full bg-surface text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
              placeholder="Ad Soyad"
              placeholderTextColor="#475569"
              value={holder}
              onChangeText={setHolder}
            />
          </View>
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">IBAN</Text>
            <TextInput
              className="w-full bg-surface text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
              placeholder="TR00 0000..."
              placeholderTextColor="#475569"
              value={iban}
              onChangeText={setIban}
            />
          </View>
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Banka Adı (Opsiyonel)</Text>
            <TextInput
              className="w-full bg-surface text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
              placeholder="Banka ismi"
              placeholderTextColor="#475569"
              value={bank}
              onChangeText={setBank}
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleWithdraw}
          disabled={withdrawMutation.isPending}
          className={`w-full py-5 rounded-2xl items-center justify-center bg-green-600 shadow-xl shadow-green-600/20 mb-20`}
        >
          {withdrawMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-black text-sm uppercase tracking-widest">Çekim Talebi Oluştur</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
