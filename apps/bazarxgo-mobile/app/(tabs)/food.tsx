import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CAMPAIGNS = [
  { id: 1, title: 'EFSANE 5\'Lİ', discount: '1500 TL İNDİRİM', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop', bg: '#FEF3C7' },
  { id: 2, title: 'EFSANE HAFTA SONU', discount: '%50 İNDİRİM', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop', bg: '#000000', color: 'white' },
];

const RESTAURANTS = [
  { 
    id: 1, 
    name: 'Köfteci Yusuf', 
    rating: 4.6, 
    tags: ['İl 5 Siparişe Özel 1500 TL İndirim', '200 TL\'ye Varan İndirim'],
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1000&auto=format&fit=crop'
  },
  { 
    id: 2, 
    name: 'Burger King', 
    rating: 4.4, 
    tags: ['İlk 5 Siparişe Özel', '600 TL Vardı'],
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1000&auto=format&fit=crop'
  }
];

export default function FoodScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* TOP HEADER */}
      <View className="px-5 py-2 flex-row items-center justify-between bg-white">
        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="close-outline" size={28} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#FEF9C3] flex-row items-center px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
          <Ionicons name="location" size={16} color="#EAB308" />
          <Text className="mx-2 font-bold text-slate-800">Teslimat Adresi Seç</Text>
          <Ionicons name="chevron-down" size={16} color="#EAB308" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="items-center">
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#475569" />
            <Text className="text-[9px] font-bold text-slate-600">Asistan</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="pricetag-outline" size={24} color="#475569" />
            <Text className="text-[9px] font-bold text-slate-600">Kuponlar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View className="bg-white px-5 pb-4 border-b border-slate-100">
        <View className="bg-slate-50 flex-row items-center px-4 rounded-xl border border-slate-100 h-12 shadow-sm">
          <Ionicons name="search" size={20} color="#1E293B" />
          <TextInput
            placeholder="Restoran, ürün veya mutfak ara"
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-3 font-bold text-slate-800"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* SORT & FILTER */}
        <View className="flex-row px-5 py-4 bg-white border-b border-slate-50">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border-r border-slate-100">
            <Ionicons name="swap-vertical-outline" size={18} color="#1E293B" />
            <Text className="ml-2 font-bold text-slate-800">Sırala</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2">
            <Ionicons name="options-outline" size={18} color="#1E293B" />
            <Text className="ml-2 font-bold text-slate-800">Filtrele</Text>
          </TouchableOpacity>
        </View>

        {/* ADDRESS ADD BANNER */}
        <View className="mx-5 my-4 bg-orange-50 p-4 rounded-2xl border border-orange-100 flex-row items-center">
          <View className="w-12 h-12 bg-orange-200/50 rounded-full items-center justify-center mr-4">
            <Ionicons name="location" size={24} color="#F97316" />
          </View>
          <View className="flex-1 pr-4">
            <Text className="text-slate-700 text-xs leading-relaxed font-bold">
              Şu anda bölgenizdeki restoranları görüntülüyorsunuz. Sipariş verebilmek için lütfen adres ekleyin.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity className="mx-5 mb-6 bg-[#F97316] py-4 rounded-xl items-center shadow-lg shadow-orange-500/20">
          <Text className="text-white font-black text-sm">Adres Ekle</Text>
        </TouchableOpacity>

        {/* CAMPAIGNS */}
        <View className="flex-row justify-between items-center px-5 mb-4">
          <Text className="text-slate-800 text-lg font-black">Kampanyalar (36)</Text>
          <TouchableOpacity>
            <Text className="text-[#F97316] font-bold">Tümü</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-8">
          {CAMPAIGNS.map((camp) => (
            <TouchableOpacity 
              key={camp.id} 
              className="mr-4 rounded-3xl overflow-hidden shadow-sm border border-slate-100"
              style={{ width: 280, backgroundColor: camp.bg }}
            >
              <View className="p-5 flex-row">
                <View className="flex-1">
                  <View className="bg-orange-500 self-start px-2 py-0.5 rounded mb-1">
                    <Text className="text-white text-[8px] font-black uppercase">EFSANE 5'Lİ</Text>
                  </View>
                  <Text className={`text-[10px] font-bold ${camp.color === 'white' ? 'text-white' : 'text-slate-800'}`}>İlk beş siparişine özel</Text>
                  <Text className={`text-xl font-black ${camp.color === 'white' ? 'text-white' : 'text-slate-800'}`}>{camp.discount}</Text>
                </View>
                <Image source={{ uri: camp.image }} className="w-24 h-24 rounded-2xl" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BAZARX GO / DISCOUNTS LINK */}
        <TouchableOpacity 
          onPress={() => router.push('/food/discounts')}
          className="mx-5 mb-8 bg-white rounded-3xl p-5 flex-row items-center justify-between border border-orange-100 shadow-sm shadow-orange-500/5"
        >
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-orange-500 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="fast-food" size={30} color="white" />
            </View>
            <View>
              <Text className="text-[#F97316] font-black text-xs uppercase tracking-widest mb-1">BazarX Go</Text>
              <Text className="text-slate-800 font-black text-base">İndirimli Menüler</Text>
              <Text className="text-slate-400 text-[10px] font-bold">En uygun fiyatlı paketleri keşfet</Text>
            </View>
          </View>
          <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
            <Ionicons name="chevron-forward" size={20} color="#F97316" />
          </View>
        </TouchableOpacity>

        {/* PROMO RESTAURANTS */}
        <View className="flex-row justify-between items-center px-5 mb-4">
          <Text className="text-slate-800 text-lg font-black">Kampanyalı Restoranlar</Text>
          <TouchableOpacity>
            <Text className="text-[#F97316] font-bold">Tümü</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5">
          {RESTAURANTS.map((res) => (
            <TouchableOpacity 
              key={res.id} 
              onPress={() => router.push(`/food/restaurant/${res.id}`)}
              className="bg-white rounded-3xl mb-6 shadow-sm border border-slate-100 overflow-hidden"
            >
              <View className="h-44 relative">
                <Image source={{ uri: res.image }} className="w-full h-full" />
                <View className="absolute top-3 left-3 space-y-1">
                  {res.tags.map((tag, i) => (
                    <View key={i} className="bg-[#F97316] px-3 py-1.5 rounded-lg self-start">
                      <Text className="text-white text-[10px] font-black">{tag}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md">
                  <Ionicons name="heart-outline" size={20} color="#475569" />
                </TouchableOpacity>
              </View>
              <View className="p-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-slate-800 text-base font-black">{res.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text className="text-slate-800 font-bold text-xs ml-1">{res.rating}</Text>
                    <Text className="text-slate-400 text-xs ml-1">(500+ Değerlendirme)</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* BOTTOM POPUP / COUNTDOWN */}
      <View className="absolute bottom-24 left-5 right-5 bg-[#FEF3C7] px-5 py-3 rounded-2xl border border-yellow-200 flex-row items-center justify-between shadow-lg">
        <View className="flex-row items-center flex-1">
          <View className="bg-white px-2 py-1 rounded-lg mr-2 border border-yellow-100">
            <Text className="text-orange-600 font-black text-xs">28:38</Text>
          </View>
          <Text className="text-slate-800 text-[10px] font-bold flex-1">içinde bu restoranlardan sipariş ver, indirimlerden birini kap!</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="close" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
