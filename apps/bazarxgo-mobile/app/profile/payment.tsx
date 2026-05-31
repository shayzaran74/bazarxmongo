import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Card {
  id: string;
  last4: string;
  brand: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Mock data for existing cards
  const [cards, setCards] = useState<Card[]>([
    { id: '1', last4: '4242', brand: 'Visa', expMonth: '12', expYear: '2025', isDefault: true },
    { id: '2', last4: '8888', brand: 'Mastercard', expMonth: '08', expYear: '2026', isDefault: false },
  ]);

  const handleDeleteCard = (id: string) => {
    Alert.alert('Kartı Sil', 'Bu ödeme yöntemini silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Sil', 
        style: 'destructive',
        onPress: () => setCards(cards.filter(c => c.id !== id))
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 py-4 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-white/5"
        >
          <Text className="text-white">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-black text-white ml-4">Ödeme Yöntemleri</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
        <Text className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Kayıtlı Kartlarınız</Text>

        {cards.map((card) => (
          <View 
            key={card.id}
            className="bg-surface p-6 rounded-3xl mb-4 border border-white/5 relative overflow-hidden"
          >
            {/* Background Pattern Mockup */}
            <View className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full" />
            
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <Text className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">
                  {card.brand} {card.isDefault ? '(Varsayılan)' : ''}
                </Text>
                <Text className="text-xl font-black text-white">•••• •••• •••• {card.last4}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Kart Sahibi</Text>
                <Text className="text-xs font-bold text-white uppercase">BazarX Kullanıcısı</Text>
              </View>
              <View>
                <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Son Kullanma</Text>
                <Text className="text-xs font-bold text-white">{card.expMonth}/{card.expYear.slice(-2)}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          onPress={() => Alert.alert('Yeni Kart Ekle', 'Ödeme sistemi entegrasyonu aşamasındayız.')}
          className="bg-accent/10 p-6 rounded-3xl border border-accent/20 border-dashed items-center justify-center flex-row space-x-2"
        >
          <Ionicons name="add-circle" size={24} color="#3B82F6" />
          <Text className="text-accent font-black text-xs uppercase tracking-widest">Yeni Kart Ekle</Text>
        </TouchableOpacity>

        <View className="mt-12 bg-surface p-6 rounded-3xl border border-white/5">
          <View className="flex-row items-center mb-4">
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text className="text-white font-black ml-3 text-sm">Güvenli Ödeme</Text>
          </View>
          <Text className="text-slate-400 text-xs leading-relaxed">
            BazarX ödeme altyapısı 256-bit SSL ile korunmaktadır. Kart bilgileriniz sunucularımızda tutulmaz, doğrudan lisanslı ödeme kuruluşu tarafından işlenir.
          </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
