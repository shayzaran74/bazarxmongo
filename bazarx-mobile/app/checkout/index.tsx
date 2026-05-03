import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function CheckoutScreen() {
  const { items, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');

  // 1. Adresleri Çek
  const { data: addressesResponse, isLoading: addressesLoading } = useQuery({
    queryKey: ['checkout-addresses'],
    queryFn: async () => {
      const res = await api.get('addresses');
      return res.data;
    }
  });

  // 2. Cüzdan Bakiyesini Çek
  const { data: walletResponse, isLoading: walletLoading } = useQuery({
    queryKey: ['checkout-wallet'],
    queryFn: async () => {
      const res = await api.get('wallet');
      return res.data;
    }
  });

  const addresses = addressesResponse?.data || addressesResponse || [];
  const accounts = walletResponse?.data?.accounts || walletResponse?.accounts || [];
  const mainAccount = accounts.find((acc: any) => acc.type === 'MAIN');
  const balance = parseFloat(mainAccount?.balance || '0');

  const total = getTotal();
  const shippingCost = 150;
  const finalTotal = total + shippingCost;
  const canPayWithWallet = balance >= finalTotal;

  // 3. Sipariş Oluşturma (Checkout) Mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddressId) throw new Error('Lütfen bir adres seçin.');
      
      const cartItems = items.map(item => ({
        listingId: item.id,
        quantity: item.quantity || 1
      }));
      
      try {
        // Önce backend'deki eski sepeti temizle (stale ürünleri silmek için)
        await api.delete('cart');
        // Sonra yerel sepeti backend ile senkronize et
        await api.post('cart/merge', { items: cartItems });
      } catch (mergeErr: any) {
        throw mergeErr;
      }

      // Şimdi siparişi tamamla
      try {
        const res = await api.post('checkout', {
          addressId: selectedAddressId,
          paymentMethod: paymentMethod === 'wallet' ? 'wallet' : 'card',
          useWallet: paymentMethod === 'wallet'
        });
        return res.data;
      } catch (checkoutErr: any) {
        throw checkoutErr;
      }
    },
    onSuccess: () => {
      clearCart();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || error.message || 'Bir hata oluştu';
      Alert.alert('Ödeme Hatası', errorMsg);
    }
  });

  if (checkoutMutation.isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-dark justify-center items-center px-8">
        <View className="w-24 h-24 bg-green-500/20 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
        </View>
        <Text className="text-3xl font-black text-white mb-2 text-center">Sipariş Alındı</Text>
        <Text className="text-slate-400 text-center mb-10 leading-relaxed text-sm">
          Siparişiniz başarıyla oluşturuldu. Sipariş numaranız: {checkoutMutation.data?.orderNumber || 'BZX-1234'}
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')}
          className="w-full py-5 bg-accent rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-black text-xs uppercase tracking-widest">Alışverişe Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-4 flex-row items-center">
        <TouchableOpacity 
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
          onPress={() => router.back()}
        >
          <Text className="text-white">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Güvenli Ödeme</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Adres Seçimi */}
        <View className="mb-6">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Teslimat Adresi</Text>
          {addressesLoading ? (
            <ActivityIndicator color="#3B82F6" />
          ) : addresses.length === 0 ? (
            <TouchableOpacity 
              onPress={() => router.push('/profile/addresses')}
              className="bg-surface p-5 rounded-3xl border border-white/5 items-center"
            >
              <Text className="text-accent font-bold text-xs uppercase">Yeni Adres Ekle</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((addr: any) => (
              <TouchableOpacity 
                key={addr.id}
                onPress={() => setSelectedAddressId(addr.id)}
                className={`bg-surface p-5 rounded-3xl mb-3 border ${selectedAddressId === addr.id ? 'border-accent' : 'border-white/5'} flex-row items-center justify-between`}
              >
                <View className="flex-row items-center flex-1 pr-4">
                  <Ionicons name="location" size={20} color={selectedAddressId === addr.id ? "#3B82F6" : "#475569"} />
                  <View className="ml-4">
                    <Text className="text-white font-bold text-sm mb-1">{addr.title}</Text>
                    <Text className="text-slate-400 text-xs" numberOfLines={1}>{addr.addressLine1}</Text>
                  </View>
                </View>
                {selectedAddressId === addr.id && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Ödeme Yöntemi */}
        <View className="mb-6">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ödeme Yöntemi</Text>
          <TouchableOpacity 
            onPress={() => setPaymentMethod('wallet')}
            className={`bg-surface p-5 rounded-3xl mb-3 border ${paymentMethod === 'wallet' ? 'border-accent' : 'border-white/5'} flex-row items-center justify-between`}
          >
            <View className="flex-row items-center">
              <Ionicons name="wallet" size={20} color={paymentMethod === 'wallet' ? "#3B82F6" : "#475569"} />
              <View className="ml-4">
                <Text className="text-white font-bold text-sm mb-1">BazarX Cüzdanı</Text>
                <Text className="text-slate-400 text-xs">
                  {walletLoading ? 'Yükleniyor...' : `Bakiye: ₺${balance.toLocaleString('tr-TR')}`}
                </Text>
              </View>
            </View>
            {paymentMethod === 'wallet' && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setPaymentMethod('card')}
            className={`bg-surface p-5 rounded-3xl border ${paymentMethod === 'card' ? 'border-accent' : 'border-white/5'} flex-row items-center justify-between`}
          >
            <View className="flex-row items-center">
              <Ionicons name="card" size={20} color={paymentMethod === 'card' ? "#3B82F6" : "#475569"} />
              <View className="ml-4">
                <Text className="text-white font-bold text-sm mb-1">Kredi Kartı</Text>
                <Text className="text-slate-400 text-xs">Online Ödeme</Text>
              </View>
            </View>
            {paymentMethod === 'card' && <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />}
          </TouchableOpacity>
        </View>

        {/* Sipariş Özeti */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sipariş Özeti</Text>
          <View className="bg-surface p-6 rounded-3xl border border-white/5">
            <View className="flex-row justify-between mb-3">
              <Text className="text-slate-400 font-bold text-xs">Ara Toplam</Text>
              <Text className="text-white font-bold text-xs">₺{total.toLocaleString('tr-TR')}</Text>
            </View>
            <View className="flex-row justify-between mb-4 pb-4 border-b border-white/10">
              <Text className="text-slate-400 font-bold text-xs">Kargo Tutarı</Text>
              <Text className="text-white font-bold text-xs">₺{shippingCost.toLocaleString('tr-TR')}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-black text-lg">Toplam</Text>
              <Text className="text-accent font-black text-2xl">₺{finalTotal.toLocaleString('tr-TR')}</Text>
            </View>
          </View>
        </View>
        <View className="h-32" />
      </ScrollView>

      {/* Checkout Button */}
      <View className="absolute bottom-0 w-full bg-surface border-t border-white/5 px-6 pt-4 pb-10">
        <TouchableOpacity 
          onPress={() => checkoutMutation.mutate()}
          disabled={checkoutMutation.isPending || !selectedAddressId || (paymentMethod === 'wallet' && !canPayWithWallet)}
          className={`w-full py-5 rounded-2xl items-center justify-center flex-row ${(!selectedAddressId || (paymentMethod === 'wallet' && !canPayWithWallet)) ? 'bg-slate-700' : checkoutMutation.isPending ? 'bg-accent/50' : 'bg-accent'}`}
        >
          {checkoutMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-black text-xs uppercase tracking-widest mr-2">
                {!selectedAddressId ? 'Adres Seçin' : (paymentMethod === 'wallet' && !canPayWithWallet) ? 'Yetersiz Bakiye' : 'Ödemeyi Tamamla'}
              </Text>
              {selectedAddressId && (paymentMethod !== 'wallet' || canPayWithWallet) && <Ionicons name="checkmark-done" size={18} color="white" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
