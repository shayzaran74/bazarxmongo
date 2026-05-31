import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DISCOUNTED_MENUS = [
  {
    id: 1,
    name: 'Ekonomik Burger Menü',
    restaurant: 'Burger King',
    rating: 4.4,
    oldPrice: 280,
    price: 185,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop',
    discount: '%34 İNDİRİM'
  },
  {
    id: 2,
    name: 'Karışık Pizza + İçecek',
    restaurant: 'Pizza Lokal',
    rating: 4.6,
    oldPrice: 350,
    price: 245,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop',
    discount: '%30 İNDİRİM'
  },
  {
    id: 3,
    name: 'Doyuran Tavuk Menü',
    restaurant: 'Popeyes',
    rating: 4.2,
    oldPrice: 240,
    price: 155,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop',
    discount: '%35 İNDİRİM'
  },
  {
    id: 4,
    name: 'Adana Kebap Menü',
    restaurant: 'Kebapçı Mahmut',
    rating: 4.8,
    oldPrice: 420,
    price: 315,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop',
    discount: '%25 İNDİRİM'
  }
];

export default function DiscountedMenusScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* HEADER */}
      <View className="px-5 py-4 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-slate-800">İndirimli Menüler</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* INFO BANNER */}
        <View className="bg-orange-500 m-5 p-4 rounded-3xl flex-row items-center">
          <View className="flex-1">
            <Text className="text-white font-black text-lg mb-1">Flaş İndirimler!</Text>
            <Text className="text-orange-100 text-xs font-bold">Günün en sevilen menüleri şimdi %50'ye varan indirimlerle.</Text>
          </View>
          <Ionicons name="flash" size={40} color="white" opacity={0.3} />
        </View>

        {/* MENU GRID */}
        <View className="px-5 flex-row flex-wrap justify-between">
          {DISCOUNTED_MENUS.map((menu) => (
            <TouchableOpacity 
              key={menu.id}
              className="bg-white rounded-3xl mb-6 shadow-sm border border-slate-100 overflow-hidden"
              style={{ width: '48%' }}
            >
              <View className="h-32 relative">
                <Image source={{ uri: menu.image }} className="w-full h-full" />
                <View className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-lg">
                  <Text className="text-white text-[8px] font-black">{menu.discount}</Text>
                </View>
              </View>
              <View className="p-3">
                <Text className="text-slate-800 font-black text-xs mb-1" numberOfLines={1}>{menu.name}</Text>
                <Text className="text-slate-400 text-[10px] mb-2">{menu.restaurant}</Text>
                
                <View className="flex-row items-center mb-3">
                  <Ionicons name="star" size={10} color="#FBBF24" />
                  <Text className="text-slate-800 font-bold text-[10px] ml-1">{menu.rating}</Text>
                </View>

                <View className="flex-row items-end justify-between">
                  <View>
                    <Text className="text-slate-400 text-[10px] line-through">₺{menu.oldPrice}</Text>
                    <Text className="text-[#F97316] font-black text-sm">₺{menu.price}</Text>
                  </View>
                  <TouchableOpacity className="w-8 h-8 bg-[#F97316] rounded-full items-center justify-center shadow-sm">
                    <Ionicons name="add" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
