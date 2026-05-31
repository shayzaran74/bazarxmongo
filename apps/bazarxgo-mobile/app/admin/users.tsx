import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdminUsers, useUpdateUserStatus, type AdminUser } from '../../hooks/useAdmin';
import { useQueryClient } from '@tanstack/react-query';

const ROLE_FILTERS = [
  { key: 'ALL',         label: 'TÜMÜ' },
  { key: 'USER',        label: 'KULLANICI' },
  { key: 'VENDOR',      label: 'SATICI' },
  { key: 'ADMIN',       label: 'ADMIN' },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:   '#10B981',
  INACTIVE: '#94A3B8',
  BANNED:   '#EF4444',
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  const { data, isLoading, isFetching, refetch } = useAdminUsers(filter === 'ALL' ? undefined : filter);
  const updateStatus = useUpdateUserStatus();

  const users: AdminUser[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const handleBan = (u: AdminUser) => {
    const isBanning = u.status !== 'BANNED';
    Alert.alert(
      isBanning ? 'Kullanıcıyı Yasakla' : 'Yasağı Kaldır',
      `${u.email} kullanıcısı için işlem yapılacak.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          style: isBanning ? 'destructive' : 'default',
          onPress: () => {
            updateStatus.mutate(
              { id: u.id, status: isBanning ? 'BANNED' : 'ACTIVE' },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                  Alert.alert('Güncellendi', 'Kullanıcı durumu değiştirildi.');
                },
                onError: () => Alert.alert('Hata', 'İşlem başarısız.'),
              }
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Kullanıcılar</Text>
        <View className="w-10" />
      </View>

      {/* Role Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        className="mb-3"
      >
        {ROLE_FILTERS.map((r) => (
          <TouchableOpacity
            key={r.key}
            onPress={() => setFilter(r.key)}
            className={`px-4 py-2 rounded-full border ${
              filter === r.key ? 'bg-accent border-accent' : 'bg-surface border-white/10'
            }`}
          >
            <Text className={`font-black text-[10px] tracking-widest ${
              filter === r.key ? 'text-white' : 'text-slate-400'
            }`}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#3B82F6" />}
      >
        {isLoading ? (
          <ActivityIndicator color="#3B82F6" className="mt-20" />
        ) : users.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="people-outline" size={36} color="#475569" />
            <Text className="text-slate-400 font-bold mt-4">Kullanıcı bulunamadı.</Text>
          </View>
        ) : (
          users.map((u) => (
            <View key={u.id} className="bg-surface p-4 rounded-3xl mb-3 border border-white/5">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-accent/20 rounded-full items-center justify-center mr-3">
                  <Text className="text-accent font-black">{u.firstName?.charAt(0) || u.email.charAt(0).toUpperCase()}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-black text-sm">
                    {u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email}
                  </Text>
                  <Text className="text-slate-400 text-[10px]">{u.email}</Text>
                </View>
                <View className="items-end gap-1">
                  <View className="bg-accent/20 px-2 py-0.5 rounded">
                    <Text className="text-accent text-[8px] font-black">{u.role}</Text>
                  </View>
                  <View className="px-2 py-0.5 rounded" style={{ backgroundColor: STATUS_COLOR[u.status] + '22' }}>
                    <Text style={{ color: STATUS_COLOR[u.status] }} className="text-[8px] font-black">
                      {u.status}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleBan(u)}
                className={`py-2.5 rounded-xl items-center border ${
                  u.status === 'BANNED'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <Text className={`font-bold text-xs ${
                  u.status === 'BANNED' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {u.status === 'BANNED' ? '✓ Yasağı Kaldır' : '⚠ Yasakla'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
