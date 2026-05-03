import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useReferralStats } from '../../hooks/useLoyalty';

export default function ReferralScreen() {
  const router = useRouter();
  const { data, isLoading } = useReferralStats();

  const stats = data?.data || data || {};
  const code: string = stats.code || '—';

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('Kopyalandı', 'Referans kodu panoya kopyalandı.');
    } catch {
      Alert.alert('Hata', 'Kod kopyalanamadı.');
    }
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `🎁 BazarX'e benim referans kodumla kayıt ol, ikimiz de XP kazanalım!\n\nKod: ${code}\n\nhttps://bazarx.com/r/${code}`,
      });
    } catch {
      Alert.alert('Hata', 'Paylaşım yapılamadı.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Referans</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6">
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : (
          <>
            {/* Hero */}
            <View className="bg-surface p-8 rounded-3xl mb-6 border border-accent/30 items-center">
              <View className="w-20 h-20 bg-accent/20 rounded-full items-center justify-center mb-4">
                <Ionicons name="gift" size={40} color="#3B82F6" />
              </View>
              <Text className="text-white text-2xl font-black mb-2 text-center">Arkadaşını Davet Et</Text>
              <Text className="text-slate-400 text-xs text-center leading-relaxed">
                Her başarılı davet için 20 XP, davet edilen 10 XP kazanır. 3. davette %20 indirim ve ₺100 voucher!
              </Text>
            </View>

            {/* Kod Kartı */}
            <View className="bg-surface p-6 rounded-3xl mb-4 border border-white/5">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Senin Kodun</Text>
              <Text className="text-white text-4xl font-black text-center tracking-widest mb-6">{code}</Text>

              <View className="flex-row gap-3">
                <TouchableOpacity onPress={copyCode} className="flex-1 bg-dark py-4 rounded-2xl items-center border border-white/10 flex-row justify-center">
                  <Ionicons name="copy-outline" size={18} color="white" />
                  <Text className="text-white font-bold text-xs ml-2 uppercase">Kopyala</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={shareCode} className="flex-1 bg-accent py-4 rounded-2xl items-center flex-row justify-center">
                  <Ionicons name="share-social-outline" size={18} color="white" />
                  <Text className="text-white font-black text-xs ml-2 uppercase">Paylaş</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* İstatistikler */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface p-5 rounded-3xl border border-white/5 items-center">
                <Text className="text-accent text-3xl font-black">{stats.totalReferrals || 0}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1 text-center">Davet</Text>
              </View>
              <View className="flex-1 bg-surface p-5 rounded-3xl border border-white/5 items-center">
                <Text className="text-yellow-400 text-3xl font-black">{stats.earnedXp || 0}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1 text-center">XP</Text>
              </View>
              <View className="flex-1 bg-surface p-5 rounded-3xl border border-white/5 items-center">
                <Text className="text-green-400 text-3xl font-black">{stats.earnedVouchers || 0}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1 text-center">Voucher</Text>
              </View>
            </View>
          </>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
