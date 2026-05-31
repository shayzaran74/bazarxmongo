import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVendorAnalytics } from '../../hooks/useVendor';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_PAD = 48;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PAD;
const CHART_HEIGHT = 160;

export default function VendorAnalyticsScreen() {
  const router = useRouter();
  const { data, isLoading } = useVendorAnalytics();

  const stats = data?.data || data || {};
  const daily: { date: string; revenue: number; orders: number }[] = stats.daily || [];
  const topProducts: any[] = stats.topProducts || [];

  const maxRevenue = Math.max(...daily.map(d => d.revenue), 1);
  const barWidth = daily.length > 0 ? (CHART_WIDTH - 40) / daily.length : 0;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white">Analitik</Text>
          <View className="w-10" />
        </View>

        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : (
          <>
            {/* Özet Kartlar */}
            <View className="px-6 mb-4 flex-row gap-3">
              <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
                <Ionicons name="trending-up" size={20} color="#10B981" />
                <Text className="text-white text-xl font-black mt-2">
                  %{stats.conversionRate?.toFixed(1) || '—'}
                </Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Dönüşüm</Text>
              </View>
              <View className="flex-1 bg-surface p-4 rounded-3xl border border-white/5">
                <Ionicons name="cash" size={20} color="#3B82F6" />
                <Text className="text-white text-xl font-black mt-2">
                  ₺{Number(stats.avgOrderValue || 0).toLocaleString('tr-TR')}
                </Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Ort. Sepet</Text>
              </View>
            </View>

            {/* Bar Chart - Günlük Ciro */}
            <View className="px-6 mb-4">
              <View className="bg-surface p-5 rounded-3xl border border-white/5">
                <Text className="text-white font-black mb-4">Son 7 Gün - Ciro</Text>

                {daily.length === 0 ? (
                  <View className="py-12 items-center">
                    <Ionicons name="bar-chart-outline" size={36} color="#475569" />
                    <Text className="text-slate-500 text-xs mt-2">Henüz satış verisi yok.</Text>
                  </View>
                ) : (
                  <>
                    <View className="flex-row items-end" style={{ height: CHART_HEIGHT }}>
                      {daily.map((d, i) => {
                        const h = (d.revenue / maxRevenue) * (CHART_HEIGHT - 30);
                        return (
                          <View key={i} className="items-center" style={{ width: barWidth }}>
                            <Text className="text-[8px] text-slate-400 mb-1">
                              ₺{(d.revenue / 1000).toFixed(0)}K
                            </Text>
                            <View
                              className="bg-accent rounded-t-lg"
                              style={{ width: barWidth - 8, height: h, minHeight: 4 }}
                            />
                          </View>
                        );
                      })}
                    </View>

                    {/* X labels */}
                    <View className="flex-row mt-2">
                      {daily.map((d, i) => (
                        <Text key={i} className="text-[8px] text-slate-500 text-center" style={{ width: barWidth }}>
                          {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                        </Text>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Top Ürünler */}
            <View className="px-6 mb-4">
              <Text className="text-white font-black text-lg mb-3">En Çok Satanlar</Text>
              {topProducts.length === 0 ? (
                <View className="bg-surface p-6 rounded-3xl border border-white/5 items-center">
                  <Ionicons name="trophy-outline" size={32} color="#475569" />
                  <Text className="text-slate-500 text-xs mt-2">Henüz veri yok.</Text>
                </View>
              ) : (
                topProducts.slice(0, 5).map((p, i) => (
                  <View key={p.id} className="bg-surface p-4 rounded-2xl mb-2 flex-row items-center border border-white/5">
                    <View className="w-8 h-8 bg-accent/20 rounded-full items-center justify-center mr-3">
                      <Text className="text-accent font-black">{i + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-black text-xs" numberOfLines={1}>{p.title}</Text>
                      <Text className="text-slate-400 text-[10px] mt-1">{p.soldCount} adet satıldı</Text>
                    </View>
                    <Text className="text-accent font-black text-xs">
                      ₺{Number(p.revenue).toLocaleString('tr-TR')}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
