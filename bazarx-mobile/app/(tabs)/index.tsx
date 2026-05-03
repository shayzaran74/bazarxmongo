import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { useNotifications } from '../../hooks/useNotifications';
import ProductCard from '../../components/common/ProductCard';

const CATEGORIES = [
  { id: '1', label: 'Yemek', icon: '🍔', bg: '#FFF7ED', color: '#F97316' },
  { id: '2', label: 'Market', icon: '🛒', bg: '#F0FDF4', color: '#22C55E' },
  { id: '3', label: 'Bugün', icon: '🏷️', bg: '#FEF2F2', color: '#EF4444' },
  { id: '4', label: 'Dolap', icon: '👗', bg: '#F5F3FF', color: '#8B5CF6' },
  { id: '5', label: 'Kupon', icon: '🎟️', bg: '#FFF1F2', color: '#F43F5E' },
  { id: '6', label: 'Elektronik', icon: '💻', bg: '#EFF6FF', color: '#3B82F6' },
];

const PAGE_SIZE = 10;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');

  // ── Featured Products ──
  const { data: bulkRes, isLoading: bulkLoading } = useQuery({
    queryKey: ['homepage-products'],
    queryFn: async () => {
      const res = await api.get('products/homepage-bulk');
      return res.data;
    },
  });
  const featured = (bulkRes?.data?.featured || []).slice(0, 8);

  // ── Infinite Scroll Products ──
  const {
    data: pagedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: pagedLoading,
  } = useInfiniteQuery({
    queryKey: ['products-infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get('products', { params: { page: pageParam, limit: PAGE_SIZE } });
      const payload = res.data?.data || res.data;
      const items = Array.isArray(payload) ? payload : payload?.items || [];
      const total = res.data?.meta?.total || res.data?.total || 0;
      return { items, page: pageParam, total };
    },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const loaded = last.page * PAGE_SIZE;
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const allProducts = useMemo(
    () => (pagedData?.pages || []).flatMap((p: any) => p.items),
    [pagedData]
  );

  const onScrollEnd = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceToBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    if (distanceToBottom < 400 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      {/* HEADER / SEARCH BAR */}
      <View className="bg-white px-5 pt-2 pb-4 flex-row items-center gap-3 border-b border-slate-100">
        <View className="flex-1 bg-slate-50 flex-row items-center px-4 rounded-xl border border-slate-100" style={{ height: 48 }}>
          <Ionicons name="search" size={20} color="#F97316" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Görselle Ara"
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2 text-slate-800 font-bold"
          />
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={22} color="#F97316" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="relative">
          <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center z-10">
            <Text className="text-white text-[8px] font-bold">8</Text>
          </View>
          <Ionicons name="mail-outline" size={26} color="#1E293B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center z-10">
              <Text className="text-white text-[8px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
          <Ionicons name="notifications-outline" size={26} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={onScrollEnd}
        scrollEventThrottle={300}
      >
        {/* SUB HEADER TABS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="bg-white py-3 px-5 border-b border-slate-100"
          contentContainerStyle={{ gap: 12 }}
        >
          <TouchableOpacity className="flex-row items-center px-4 py-2 rounded-full border border-slate-100">
            <Ionicons name="menu" size={18} color="#1E293B" />
            <Text className="ml-2 font-bold text-slate-700">Kategoriler</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#F97316] px-6 py-2 rounded-full">
            <Text className="text-white font-bold">Kadın</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white px-6 py-2 rounded-full border border-slate-100">
            <Text className="text-slate-700 font-bold">Erkek</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white px-6 py-2 rounded-full border border-slate-100">
            <Text className="text-slate-700 font-bold">Avantajlar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* PROMO BANNER */}
        <View className="px-5 my-4">
          <TouchableOpacity className="rounded-2xl overflow-hidden shadow-sm">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop' }} 
              className="w-full h-40"
            />
            <View className="absolute inset-0 bg-black/20 p-5 justify-center">
              <View className="bg-orange-500 self-start px-2 py-0.5 rounded mb-1">
                <Text className="text-white text-[10px] font-black">LANSMAN GÜNÜ</Text>
              </View>
              <Text className="text-white text-2xl font-black">2 Yıl Özgürlük!</Text>
              <Text className="text-white/90 text-sm font-bold">2000 TL indirim kuponu!</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CIRCLE CATEGORIES */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 20, paddingBottom: 20 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} className="items-center" style={{ width: 70 }}>
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-2 border border-slate-100 shadow-sm"
                style={{ backgroundColor: 'white' }}
              >
                <Text className="text-3xl">{cat.icon}</Text>
              </View>
              <Text className="text-slate-700 text-[11px] font-bold text-center" numberOfLines={2}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* POPULAR PRODUCTS SECTION */}
        <View className="px-5 flex-row justify-between items-center mb-4">
          <Text className="text-slate-800 text-lg font-black">Popüler Ürünler</Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-[#F97316] font-bold text-sm">Tümünü Gör</Text>
            <Ionicons name="chevron-forward" size={16} color="#F97316" />
          </TouchableOpacity>
        </View>

        {bulkLoading ? (
          <ActivityIndicator color="#F97316" className="py-10" />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {featured.map((item: any, idx: number) => (
              <ProductCard 
                key={item.id}
                id={item.id}
                title={item.title || item.name}
                price={item.price || 0}
                image={item.images?.[0] || 'https://via.placeholder.com/300'}
                isBestseller={idx < 3}
                isGoodPrice={idx % 2 === 0}
                onPress={() => router.push(`/product/${item.id}` as any)}
              />
            ))}
          </ScrollView>
        )}

        {/* FEED SECTION */}
        <View className="px-5 mt-6">
          <Text className="text-slate-800 text-lg font-black mb-4">Sizin İçin Seçtiklerimiz</Text>
          
          {pagedLoading ? (
            <ActivityIndicator color="#F97316" className="py-20" />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {allProducts.map((item: any, idx: number) => (
                <View key={item.id} style={{ width: '48%' }}>
                  <ProductCard 
                    id={item.id}
                    title={item.title || item.name}
                    price={item.price || 0}
                    image={item.images?.[0] || 'https://via.placeholder.com/300'}
                    isBestseller={idx < 2}
                    onPress={() => router.push(`/product/${item.id}` as any)}
                  />
                </View>
              ))}
            </View>
          )}

          {isFetchingNextPage && (
            <ActivityIndicator color="#F97316" className="py-6" />
          )}
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
