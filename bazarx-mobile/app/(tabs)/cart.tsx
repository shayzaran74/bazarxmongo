import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cart';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { items, updateQuantity, removeFromCart, getTotal } = useCartStore();
  const router = useRouter();

  const total = getTotal();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-6">
        <View className="mt-6 mb-8">
          <Text className="text-3xl font-black text-white">Sepetim</Text>
          <Text className="text-sm font-bold text-slate-400 mt-1">
            {items.length > 0 ? `${items.length} ürün var` : 'Sepetiniz henüz boş'}
          </Text>
        </View>

        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 mt-10">
            <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border border-white/5">
              <Ionicons name="cart-outline" size={40} color="#475569" />
            </View>
            <Text className="text-xl font-bold text-white mb-2">Sepetiniz Boş</Text>
            <Text className="text-sm text-slate-400 text-center mb-8 px-8">
              BazarX kataloğundan veya takas havuzundan ürün ekleyerek alışverişe başlayın.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/product/list')}
              className="bg-accent px-8 py-4 rounded-2xl"
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                Ürünleri Keşfet
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {items.map((item) => (
              <View key={item.id} className="bg-surface p-4 rounded-3xl border border-white/5 flex-row items-center">
                <View className="w-20 h-20 bg-slate-800 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="cube-outline" size={32} color="#334155" />
                </View>
                
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm mb-1" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text className="text-accent font-black text-xs mb-3">
                    {item.priceFormatted}
                  </Text>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center bg-[#001A30] rounded-lg">
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Ionicons name="remove" size={16} color="white" />
                      </TouchableOpacity>
                      <Text className="text-white font-black px-2">{item.quantity}</Text>
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Ionicons name="add" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            
            <View className="h-40" />
          </View>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View className="absolute bottom-[90px] w-full bg-surface border-t border-white/5 px-6 pt-4 pb-6 rounded-t-3xl">
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-400 font-bold">Toplam Tutar</Text>
            <Text className="text-xl font-black text-white">
              ₺{total.toLocaleString('tr-TR')}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/checkout')}
            className="w-full py-5 bg-accent rounded-2xl items-center justify-center flex-row"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest mr-2">
              Ödemeye Geç
            </Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
