import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCartStore } from '../../store/cart';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Gerçek veriyi Katalog API'sinden çekiyoruz
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['catalog-item', id],
    queryFn: async () => {
      // Backend'deki endpoint slug veya ID ile çalışıyor
      const res = await api.get(`products/slug/${id}`);
      return res.data;
    }
  });

  const product = response?.data || response;

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    
    // Sepete Ekle - ÖNEMLİ: Backend checkout için listingId bekliyor
    addToCart({
      id: product.listingId || product.id,
      title: product.title || product.name,
      price: product.price || 0,
      priceFormatted: `₺${(product.price || 0).toLocaleString('tr-TR')}`,
      vendor: product.company?.name || product.vendor?.name || 'Doğrulanmış Satıcı'
    });

    // Başarıyla eklendi mesajı ve otomatik geri dönüş
    setTimeout(() => {
      setAddingToCart(false);
      router.back();
    }, 600);
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `BazarX'te bu ürüne göz at: ${product.title || product.name} - ₺${(product.price || 0).toLocaleString('tr-TR')}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-white font-bold mt-4">İlan Detayı Yükleniyor...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
        <Text className="text-red-400 font-bold mt-4">Ürün bulunamadı veya bir hata oluştu.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-surface px-6 py-3 rounded-full">
          <Text className="text-white font-bold">Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryName = product.category?.name || 'GENEL';
  const vendorName = product.company?.name || product.vendor?.name || 'Doğrulanmış Satıcı';
  const priceStr = `₺${(product.price || 0).toLocaleString('tr-TR')}`;
  const features = product.features || product.attributes || [];

  return (
    <View className="flex-1 bg-dark">
      <ScrollView className="flex-1" bounces={false}>
        
        {/* Product Image Area */}
        <View className="w-full h-80 bg-slate-800 relative items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <Image source={{ uri: product.images[0] }} className="w-full h-full absolute" resizeMode="cover" />
          ) : (
            <Ionicons name="laptop-outline" size={80} color="#334155" />
          )}
          
          {/* Top Actions */}
          <SafeAreaView className="absolute top-0 w-full px-6 flex-row justify-between pt-4">
            <TouchableOpacity 
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
              onPress={() => router.back()}
            >
              <Text className="text-white">←</Text>
            </TouchableOpacity>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-10 h-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#EF4444" : "white"} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Product Info */}
        <View className="px-6 py-8">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/10 px-3 py-1.5 rounded-lg">
              {categoryName}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text className="text-slate-300 text-xs font-bold ml-1">Yeni</Text>
            </View>
          </View>
          
          <Text className="text-3xl font-black text-white mb-2">{product.title || product.name}</Text>
          <Text className="text-2xl font-bold text-slate-300 mb-6">{priceStr}</Text>

          <View className="flex-row items-center bg-surface p-4 rounded-2xl mb-8 border border-white/5">
            <View className="w-12 h-12 bg-primary rounded-full items-center justify-center border border-accent">
              <Text className="text-white font-black">{vendorName.charAt(0)}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-white font-bold">{vendorName}</Text>
              <Text className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Doğrulanmış Satıcı</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-accent text-xs font-bold">Profili Gör</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-lg font-black text-white mb-3">İlan Detayı</Text>
          <Text className="text-slate-400 leading-relaxed text-sm mb-8">
            {product.description || 'Bu ilan için henüz bir açıklama girilmemiş.'}
          </Text>

          {features.length > 0 && (
            <>
              <Text className="text-lg font-black text-white mb-3">Özellikler</Text>
              <View className="space-y-3 mb-12">
                {features.map((feature: any, idx: number) => (
                  <View key={idx} className="flex-row items-center">
                    <View className="w-1.5 h-1.5 bg-accent rounded-full mr-3" />
                    <Text className="text-slate-300">{typeof feature === 'string' ? feature : `${feature.name}: ${feature.value}`}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          {/* Spacer for bottom bar */}
          <View className="h-20" /> 
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 w-full bg-surface border-t border-white/5 px-6 pt-4 pb-10 flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Tutar</Text>
          <Text className="text-xl font-black text-white">{priceStr}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleAddToCart}
          disabled={addingToCart}
          className={`px-8 py-4 rounded-2xl items-center justify-center flex-row ${addingToCart ? 'bg-accent/50' : 'bg-accent'}`}
        >
          <Ionicons name="cart-outline" size={20} color="white" />
          <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">
            {addingToCart ? 'Eklendi!' : 'Sepete Ekle'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
