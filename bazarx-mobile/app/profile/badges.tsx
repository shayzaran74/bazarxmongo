import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBadges, type Badge } from '../../hooks/useLoyalty';

export default function BadgesScreen() {
  const router = useRouter();
  const { data, isLoading } = useBadges();

  const badges: Badge[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  const earned = badges.filter(b => b.isEarned);
  const locked = badges.filter(b => !b.isEarned);

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Rozetlerim</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6">
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : (
          <>
            {/* İstatistik */}
            <View className="bg-surface p-5 rounded-3xl mb-6 border border-accent/30 flex-row justify-around">
              <View className="items-center">
                <Text className="text-accent text-3xl font-black">{earned.length}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1">Kazanılan</Text>
              </View>
              <View className="w-px bg-white/10" />
              <View className="items-center">
                <Text className="text-slate-500 text-3xl font-black">{locked.length}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase mt-1">Kalan</Text>
              </View>
            </View>

            {/* Kazanılan */}
            {earned.length > 0 && (
              <>
                <Text className="text-white font-black text-sm mb-3 uppercase tracking-widest">Kazanılan</Text>
                <View className="flex-row flex-wrap justify-between mb-6">
                  {earned.map((b) => (
                    <View
                      key={b.id}
                      style={{ width: '48%' }}
                      className="bg-surface p-4 rounded-3xl border border-accent/30 mb-3 items-center"
                    >
                      <View className="w-16 h-16 bg-accent/20 rounded-full items-center justify-center mb-3">
                        <Ionicons name={(b.icon as any) || 'medal'} size={32} color="#3B82F6" />
                      </View>
                      <Text className="text-white font-black text-xs text-center">{b.name}</Text>
                      {b.description && (
                        <Text className="text-slate-400 text-[10px] text-center mt-1" numberOfLines={2}>{b.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Kilitli */}
            {locked.length > 0 && (
              <>
                <Text className="text-slate-500 font-black text-sm mb-3 uppercase tracking-widest">Kilitli</Text>
                <View className="flex-row flex-wrap justify-between">
                  {locked.map((b) => (
                    <View
                      key={b.id}
                      style={{ width: '48%' }}
                      className="bg-surface p-4 rounded-3xl border border-white/5 mb-3 items-center opacity-50"
                    >
                      <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-3">
                        <Ionicons name="lock-closed" size={28} color="#475569" />
                      </View>
                      <Text className="text-slate-400 font-black text-xs text-center">{b.name}</Text>
                      {b.description && (
                        <Text className="text-slate-500 text-[10px] text-center mt-1" numberOfLines={2}>{b.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            {badges.length === 0 && (
              <View className="py-20 items-center">
                <Ionicons name="medal-outline" size={48} color="#475569" />
                <Text className="text-slate-400 font-bold mt-4">Henüz rozet bulunmuyor.</Text>
              </View>
            )}
          </>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
