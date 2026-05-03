import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  isBestseller?: boolean;
  isGoodPrice?: boolean;
  onPress?: () => void;
}

export default function ProductCard({
  title,
  price,
  image,
  rating = 4.5,
  reviewCount = 120,
  isBestseller = false,
  isGoodPrice = false,
  onPress
}: ProductCardProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden w-[170px] mb-4"
    >
      {/* Product Image Container */}
      <View className="relative w-full aspect-[3/4] bg-slate-50">
        <Image 
          source={{ uri: image }} 
          className="w-full h-full object-cover"
        />
        
        {/* Favorite Button */}
        <TouchableOpacity 
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm border border-slate-50"
        >
          <Ionicons name="heart-outline" size={18} color="#475569" />
        </TouchableOpacity>

        {/* Bestseller Badge */}
        {isBestseller && (
          <View className="absolute top-2 left-2 bg-[#F97316] px-2 py-1 rounded-md">
            <Text className="text-[8px] font-black text-white uppercase">EN ÇOK SATAN</Text>
          </View>
        )}

        {/* Good Price Badge */}
        {isGoodPrice && (
          <View className="absolute bottom-2 left-2 bg-[#FFD700] px-2 py-0.5 rounded-md border border-yellow-400">
            <Text className="text-[8px] font-black text-slate-800 uppercase">İYİ FİYAT</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View className="p-3">
        <Text className="text-slate-800 font-bold text-xs mb-1" numberOfLines={2}>
          {title}
        </Text>
        
        {/* Rating Row */}
        <View className="flex-row items-center mb-2">
          <View className="flex-row mr-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons 
                key={s} 
                name={s <= Math.floor(rating) ? "star" : "star-outline"} 
                size={10} 
                color="#F59E0B" 
              />
            ))}
          </View>
          <Text className="text-[10px] text-slate-400 font-bold">({reviewCount})</Text>
        </View>

        {/* Price Section */}
        <View>
          <Text className="text-[#F97316] font-black text-base">
            {price.toLocaleString('tr-TR')} TL
          </Text>
          <Text className="text-[9px] text-slate-400 mt-0.5">
            ( {(price / 10).toFixed(2)} TL / adet )
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
