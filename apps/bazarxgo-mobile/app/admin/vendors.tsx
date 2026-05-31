import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdminVendors, useApproveVendor, useRejectVendor, type AdminVendor } from '../../hooks/useAdmin';
import { useQueryClient } from '@tanstack/react-query';

const STATUS_FILTERS = [
  { key: 'PENDING',  label: 'BEKLEYEN',  color: '#F59E0B' },
  { key: 'APPROVED', label: 'ONAYLI',    color: '#10B981' },
  { key: 'REJECTED', label: 'RED',       color: '#EF4444' },
];

export default function AdminVendorsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('PENDING');
  const [rejectModal, setRejectModal] = useState<AdminVendor | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, isFetching, refetch } = useAdminVendors(filter);
  const approve = useApproveVendor();
  const reject = useRejectVendor();

  const vendors: AdminVendor[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  const handleApprove = (v: AdminVendor) => {
    Alert.alert(
      'Satıcıyı Onayla',
      `${v.companyName} onaylanacak. Devam edilsin mi?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            approve.mutate(v.id, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
                queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
                Alert.alert('Onaylandı', 'Satıcıya bildirim gönderildi.');
              },
              onError: () => Alert.alert('Hata', 'Onaylanamadı.'),
            });
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!rejectModal || rejectReason.length < 5) {
      Alert.alert('Eksik', 'Red nedeni en az 5 karakter olmalı.');
      return;
    }
    reject.mutate(
      { id: rejectModal.id, reason: rejectReason },
      {
        onSuccess: () => {
          setRejectModal(null);
          setRejectReason('');
          queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
          queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
          Alert.alert('Reddedildi', 'Satıcıya bildirim gönderildi.');
        },
        onError: () => Alert.alert('Hata', 'İşlem başarısız.'),
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Satıcı Onayları</Text>
        <View className="w-10" />
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        className="mb-3"
      >
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setFilter(s.key)}
            className={`px-4 py-2 rounded-full border ${
              filter === s.key ? 'border-transparent' : 'bg-surface border-white/10'
            }`}
            style={filter === s.key ? { backgroundColor: s.color } : {}}
          >
            <Text className={`font-black text-[10px] tracking-widest ${
              filter === s.key ? 'text-white' : 'text-slate-400'
            }`}>
              {s.label}
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
        ) : vendors.length === 0 ? (
          <View className="py-20 items-center">
            <Ionicons name="storefront-outline" size={36} color="#475569" />
            <Text className="text-slate-400 font-bold mt-4">Bu kategoride satıcı yok.</Text>
          </View>
        ) : (
          vendors.map((v) => (
            <View key={v.id} className="bg-surface p-5 rounded-3xl mb-3 border border-white/5">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-white font-black text-base mb-1">{v.companyName}</Text>
                  <Text className="text-slate-400 text-[10px]">{v.email}</Text>
                </View>
                <View className="bg-yellow-500/20 px-2 py-1 rounded">
                  <Text className="text-yellow-400 text-[9px] font-black">{v.status}</Text>
                </View>
              </View>

              <View className="flex-row gap-3 mb-3 pt-3 border-t border-white/5">
                <View className="flex-1">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase">VKN</Text>
                  <Text className="text-white text-xs font-bold mt-0.5">{v.taxNumber || '—'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase">Şehir</Text>
                  <Text className="text-white text-xs font-bold mt-0.5">{v.city || '—'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-500 text-[9px] font-bold uppercase">Tarih</Text>
                  <Text className="text-white text-xs font-bold mt-0.5">
                    {new Date(v.createdAt).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              </View>

              {v.status === 'PENDING' && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setRejectModal(v)}
                    className="flex-1 bg-red-500/10 py-3 rounded-xl items-center border border-red-500/20"
                  >
                    <Text className="text-red-400 font-black text-xs">REDDET</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleApprove(v)}
                    className="flex-1 bg-accent py-3 rounded-xl items-center"
                  >
                    <Text className="text-white font-black text-xs">ONAYLA</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Reject Modal */}
      <Modal visible={!!rejectModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-dark p-6 rounded-t-3xl">
            <View className="w-12 h-1 bg-slate-700 self-center rounded-full mb-6" />
            <Text className="text-white font-black text-xl mb-2">Satıcıyı Reddet</Text>
            <Text className="text-slate-400 text-xs mb-4">
              {rejectModal?.companyName} için red nedeni:
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Eksik belge, geçersiz vergi no, vs."
              placeholderTextColor="#475569"
              className="bg-surface text-white p-4 rounded-2xl border border-white/10 mb-4"
              style={{ minHeight: 100 }}
            />
            <TouchableOpacity
              onPress={handleReject}
              disabled={reject.isPending}
              className="bg-red-500 py-4 rounded-2xl items-center"
            >
              {reject.isPending
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-black uppercase tracking-widest">Reddet</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setRejectModal(null); setRejectReason(''); }} className="py-3 mt-2 items-center">
              <Text className="text-slate-400 font-bold text-xs">Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
