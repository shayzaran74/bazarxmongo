import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../../../store/cart';

const RESTAURANT_DATA = {
  id: 1,
  name: 'Köfteci Yusuf',
  rating: 4.6,
  reviews: '500+ Değerlendirme',
  time: '25-35 dk',
  minAmount: '₺150 Alt Limit',
  cover: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1000&auto=format&fit=crop',
  categories: ['Popüler', 'Menüler', 'Köfteler', 'Burgerler', 'Tatlılar', 'İçecekler'],
  menu: [
    {
      id: 101,
      category: 'Popüler',
      name: 'Yusuf Burger Menü',
      description: 'Özel Yusuf Burger, patates kızartması ve seçeceğiniz içecek ile.',
      price: 185,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 102,
      category: 'Popüler',
      name: 'Ekmek Arası Köfte (5 Adet)',
      description: 'Izgara köfte, domates, biber ve yeşillik ile.',
      price: 145,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop'
    },
    {
      id: 103,
      category: 'Köfteler',
      name: 'Porsiyon Köfte (10 Adet)',
      description: 'Geleneksel Yusuf köftesi, közlenmiş biber ve domates ile.',
      price: 220,
      image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9583f6?q=80&w=1000&auto=format&fit=crop'
    }
  ]
};

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeCategory, setActiveCategory] = useState('Popüler');
  const [addingId, setAddingId] = useState<number | null>(null);
  
  const { addToCart, items, getTotal } = useCartStore();

  const handleAddToCart = (item: any) => {
    setAddingId(item.id);
    
    addToCart({
      id: item.id.toString(),
      title: item.name,
      price: item.price,
      priceFormatted: `₺${item.price.toLocaleString('tr-TR')}`,
      vendor: RESTAURANT_DATA.name
    });

    setTimeout(() => {
      setAddingId(null);
      router.back();
    }, 600);
  };

  const total = getTotal();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER COVER */}
      <View className="h-64 relative">
        <Image source={{ uri: RESTAURANT_DATA.cover }} className="w-full h-full" />
        <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between px-5 pt-2">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md">
              <Ionicons name="search" size={20} color="#1E293B" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md">
              <Ionicons name="heart-outline" size={20} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* RESTAURANT INFO CARD */}
      <View className="px-5 -mt-12">
        <View className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200 border border-slate-50">
          <Text className="text-2xl font-black text-slate-800 mb-2">{RESTAURANT_DATA.name}</Text>
          <View className="flex-row items-center mb-4">
            <Ionicons name="star" size={16} color="#FBBF24" />
            <Text className="text-slate-800 font-bold text-sm ml-1">{RESTAURANT_DATA.rating}</Text>
            <Text className="text-slate-400 text-xs ml-1">({RESTAURANT_DATA.reviews})</Text>
            <TouchableOpacity className="ml-auto">
              <Text className="text-[#F97316] font-bold text-xs underline">Yorumlar</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between border-t border-slate-50 pt-4">
            <View className="items-center flex-1 border-r border-slate-50">
              <Ionicons name="time-outline" size={18} color="#475569" />
              <Text className="text-slate-800 font-bold text-[10px] mt-1">{RESTAURANT_DATA.time}</Text>
            </View>
            <View className="items-center flex-1 border-r border-slate-50">
              <Ionicons name="bicycle-outline" size={18} color="#475569" />
              <Text className="text-slate-800 font-bold text-[10px] mt-1">Ücretsiz</Text>
            </View>
            <View className="items-center flex-1">
              <Ionicons name="card-outline" size={18} color="#475569" />
              <Text className="text-slate-800 font-bold text-[10px] mt-1">{RESTAURANT_DATA.minAmount}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View className="h-4" />
        
        {/* CATEGORY TABS */}
        <View className="bg-white py-4 border-b border-slate-50">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
            {RESTAURANT_DATA.categories.map((cat) => (
              <TouchableOpacity 
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`mr-4 px-5 py-2.5 rounded-full ${activeCategory === cat ? 'bg-[#F97316]' : 'bg-slate-50'}`}
              >
                <Text className={`font-bold text-xs ${activeCategory === cat ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* MENU LIST */}
        <View className="px-5 pt-6 pb-20">
          <Text className="text-xl font-black text-slate-800 mb-6">{activeCategory}</Text>
          
          {RESTAURANT_DATA.menu.filter(m => m.category === activeCategory || activeCategory === 'Popüler').map((item) => (
            <TouchableOpacity 
              key={item.id}
              className="flex-row mb-8 items-start"
            >
              <View className="flex-1 pr-4">
                <Text className="text-slate-800 font-black text-base mb-1">{item.name}</Text>
                <Text className="text-slate-400 text-xs leading-relaxed mb-3" numberOfLines={2}>
                  {item.description}
                </Text>
                <Text className="text-[#F97316] font-black text-base">₺{item.price}</Text>
              </View>
              <View className="relative">
                <Image source={{ uri: item.image }} className="w-24 h-24 rounded-2xl" />
                <TouchableOpacity 
                  onPress={() => handleAddToCart(item)}
                  disabled={addingId !== null}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg border border-slate-100"
                >
                  {addingId === item.id ? (
                    <ActivityIndicator size="small" color="#F97316" />
                  ) : (
                    <Ionicons name="add" size={24} color="#F97316" />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FLOATING CART BUTTON */}
      {cartItemCount > 0 && (
        <TouchableOpacity 
          onPress={() => router.push('/cart')}
          className="absolute bottom-28 left-5 right-5 bg-[#F97316] p-4 rounded-2xl flex-row items-center justify-between shadow-xl shadow-orange-500/30"
        >
          <View className="flex-row items-center">
            <View className="bg-white/20 px-3 py-1 rounded-lg mr-3">
              <Text className="text-white font-black">{cartItemCount}</Text>
            </View>
            <Text className="text-white font-black">Sepeti Görüntüle</Text>
          </View>
          <Text className="text-white font-black text-lg">₺{total.toLocaleString('tr-TR')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
