import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

import ProductCard from '../../components/common/ProductCard';

export default function ProductListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tümü');

  const categories = ['Tümü', 'Elektronik', 'Mobilya', 'Araç', 'Hizmet', 'Gıda'];

  // Gerçek ürünleri API'den çekiyoruz
  const { data, isLoading, error } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const response = await api.get('products');
      return response.data;
    }
  });

  const products = data?.data || [];

  const filteredProducts = products.filter((p: any) => 
    (activeCategory === 'Tümü' || p.category?.name === activeCategory || p.categoryId === activeCategory) &&
    (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-6 mt-6 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-4">
          <TouchableOpacity 
            className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-4"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-slate-800">Katalog</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm">
          <Ionicons name="filter" size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-6">
        <View className="w-full bg-white rounded-2xl border border-slate-100 flex-row items-center px-4 shadow-sm">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            className="flex-1 text-slate-800 px-3 py-4 font-bold"
            placeholder="Ürün, marka veya satıcı arayın..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View className="mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
          {categories.map((cat, idx) => (
            <TouchableOpacity 
              key={idx}
              onPress={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full mr-3 border ${activeCategory === cat ? 'bg-[#F97316] border-[#F97316]' : 'bg-white border-slate-100'}`}
            >
              <Text className={`text-xs font-bold ${activeCategory === cat ? 'text-white' : 'text-slate-500'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-6" />
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-slate-400 mt-4 font-bold">İlanlar yükleniyor...</Text>
          </View>
        ) : error ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
            <Text className="text-red-400 mt-4 font-bold">Veriler alınırken bir hata oluştu.</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredProducts.map((item: any, idx: number) => (
              <View key={item.id} style={{ width: '48%' }}>
                <ProductCard 
                  id={item.id}
                  title={item.title || item.name}
                  price={item.price || 0}
                  image={item.images?.[0] || 'https://via.placeholder.com/300'}
                  isBestseller={idx < 2}
                  onPress={() => router.push(`/product/${item.id}`)}
                />
              </View>
            ))}
            {filteredProducts.length === 0 && (
              <View className="w-full py-20 items-center justify-center">
                <Ionicons name="search-outline" size={40} color="#94A3B8" />
                <Text className="text-slate-500 mt-4 font-bold text-center">Aramanıza uygun ilan bulunamadı.</Text>
              </View>
            )}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
