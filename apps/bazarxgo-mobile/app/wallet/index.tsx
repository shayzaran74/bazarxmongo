import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function WalletScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Geçmiş');

  // 1. Cüzdan Bakiyesini Çekme
  const { data: walletResponse, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const response = await api.get('wallet');
      return response.data;
    }
  });

  // 2. İşlem Geçmişini Çekme
  const { data: trxResponse, isLoading: trxLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const response = await api.get('wallet/transactions');
      return response.data;
    }
  });

  // 3. Hediye Kartlarını Çekme
  const { data: giftCardsResponse, isLoading: giftCardsLoading } = useQuery({
    queryKey: ['wallet-gift-cards'],
    queryFn: async () => {
      const response = await api.get('wallet/gift-cards');
      return response.data;
    }
  });

  // Gerçek veri yapısına göre (accounts dizisi) eşleme yapıyoruz
  const rawData = walletResponse?.data || walletResponse;
  const accounts = rawData?.accounts || [];
  const mainAccount = accounts.find((acc: any) => acc.type === 'MAIN') || accounts[0];
  
  const parseBalance = (val: any) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    const cleanVal = String(val).replace(/[^0-9.,]/g, '').replace(',', '.');
    return parseFloat(cleanVal) || 0;
  };

  const balance = parseBalance(mainAccount?.balance || mainAccount?.availableBalance);
  // XP hesabı varsa onu al, yoksa 0
  const xpAccount = accounts.find((acc: any) => acc.type?.includes('XP'));
  const xp = parseBalance(xpAccount?.balance || 0);

  // Safe Array mapping
  const transactions = Array.isArray(trxResponse?.data?.items) 
    ? trxResponse.data.items 
    : Array.isArray(trxResponse?.data) 
      ? trxResponse.data 
      : Array.isArray(trxResponse) 
        ? trxResponse 
        : [];

  const giftCards = Array.isArray(giftCardsResponse?.data?.items)
    ? giftCardsResponse.data.items
    : Array.isArray(giftCardsResponse?.data)
      ? giftCardsResponse.data
      : Array.isArray(giftCardsResponse)
        ? giftCardsResponse
        : [];

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-6 mt-6 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-4"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-slate-800">Cüzdanım</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm">
          <Ionicons name="settings-outline" size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Wallet Card - Keep gradient but adjust for light bg */}
        <View className="bg-gradient-to-br from-primary to-[#003866] p-6 rounded-3xl mb-8 relative overflow-hidden shadow-xl shadow-primary/20">
          <View className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">
                TOPLAM BAKİYE
              </Text>
              {balanceLoading ? (
                <ActivityIndicator color="white" className="mt-2 self-start" />
              ) : (
                <Text className="text-4xl font-black text-white">₺{Number(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              )}
            </View>
            <View className="bg-white/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Text className="text-white text-xs font-bold">BazarX Koruması</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between items-center pt-4 border-t border-white/10">
            <View>
              <Text className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">
                SADAKAT PUANI
              </Text>
              <Text className="text-base font-bold text-white">{xp} XP</Text>
            </View>
            <Ionicons name="card-outline" size={32} color="#93C5FD" opacity={0.8} />
          </View>
        </View>

        {/* Quick Actions - Light style */}
        <View className="flex-row justify-between mb-8 space-x-4">
          <TouchableOpacity 
            onPress={() => router.push('/wallet/topup')}
            className="flex-1 bg-white p-4 rounded-2xl items-center border border-slate-100 shadow-sm"
          >
            <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="add" size={24} color="#F97316" />
            </View>
            <Text className="text-slate-700 font-bold text-xs">Para Yükle</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/wallet/withdraw')}
            className="flex-1 bg-white p-4 rounded-2xl items-center border border-slate-100 shadow-sm"
          >
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="arrow-up" size={24} color="#22C55E" />
            </View>
            <Text className="text-slate-700 font-bold text-xs">Para Çek</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-white p-4 rounded-2xl items-center border border-slate-100 shadow-sm">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="swap-horizontal" size={24} color="#3B82F6" />
            </View>
            <Text className="text-slate-700 font-bold text-xs">Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Gift Cards Section */}
        {giftCards.length > 0 && (
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-black text-slate-800">Hediye Kartlarım</Text>
              <TouchableOpacity onPress={() => router.push('/profile/payment')}>
                <Text className="text-[#F97316] text-xs font-bold">Yönet</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
              {giftCards.map((card: any) => (
                <View key={card.id} className="bg-white p-5 rounded-3xl mr-4 w-72 border border-slate-100 shadow-sm relative overflow-hidden">
                  <View className="absolute -right-4 -bottom-4 w-20 h-20 bg-orange-500/5 rounded-full" />
                  <View className="flex-row justify-between items-start mb-6">
                    <View className="bg-orange-50 p-2 rounded-xl">
                      <Ionicons name="gift-outline" size={20} color="#F97316" />
                    </View>
                    <View className="bg-green-100 px-2 py-1 rounded-lg">
                      <Text className="text-green-700 text-[10px] font-black uppercase tracking-widest">{card.status}</Text>
                    </View>
                  </View>
                  <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Kart Kodu</Text>
                  <Text className="text-slate-800 font-mono font-bold text-lg mb-4 tracking-tighter">{card.code}</Text>
                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Bakiye</Text>
                      <Text className="text-slate-800 font-black text-xl">₺{parseFloat(card.currentValue || 0).toLocaleString('tr-TR')}</Text>
                    </View>
                    {card.expiresAt && (
                      <View className="items-end">
                        <Text className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Son Kullanma</Text>
                        <Text className="text-slate-400 text-[10px] font-bold">{new Date(card.expiresAt).toLocaleDateString('tr-TR')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <Text className="text-lg font-black text-slate-800 mb-4">Son İşlemler</Text>
        
        {/* Transaction List */}
        <View className="space-y-4">
          {trxLoading ? (
            <ActivityIndicator color="#F97316" className="py-10" />
          ) : transactions.length === 0 ? (
            <View className="py-10 items-center justify-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <Text className="text-slate-400 font-bold">Henüz bir işlem bulunmuyor.</Text>
            </View>
          ) : transactions.map((trx: any, idx: number) => (
            <View key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center mb-3">
              <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${trx.type === 'DEPOSIT' || trx.type === 'CREDIT' ? 'bg-green-50' : 'bg-red-50'}`}>
                <Ionicons 
                  name={trx.type === 'DEPOSIT' || trx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} 
                  size={20} 
                  color={trx.type === 'DEPOSIT' || trx.type === 'CREDIT' ? '#22C55E' : '#EF4444'} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 font-bold text-sm mb-1">{trx.description || trx.type}</Text>
                <Text className="text-slate-500 text-xs">
                  {new Date(trx.createdAt).toLocaleDateString('tr-TR')} • {trx.id.substring(0, 8).toUpperCase()}
                </Text>
              </View>
              <View className="items-end">
                <Text className={`font-black mb-1 ${trx.type === 'DEPOSIT' || trx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-800'}`}>
                  {trx.type === 'DEPOSIT' || trx.type === 'CREDIT' ? '+' : '-'}₺{trx.amount?.toLocaleString('tr-TR')}
                </Text>
                <Text className={`text-[10px] font-black uppercase ${trx.status === 'PENDING' ? 'text-yellow-600' : 'text-slate-400'}`}>
                  {trx.status === 'COMPLETED' ? 'Tamamlandı' : trx.status === 'PENDING' ? 'Beklemede' : trx.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
