import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useCreateVendorProduct,
  useUpdateVendorProduct,
  useVendorProduct,
} from '../../../hooks/useVendor';
import { useQueryClient } from '@tanstack/react-query';

export default function VendorProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id && id !== 'create';
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: existingRes } = useVendorProduct(isEdit ? id : '');
  const create = useCreateVendorProduct();
  const update = useUpdateVendorProduct(id || '');

  const existing = existingRes?.data || existingRes;

  const [form, setForm] = useState({
    title: existing?.title || '',
    description: existing?.description || '',
    price: existing?.price?.toString() || '',
    stock: existing?.stock?.toString() || '',
    categoryId: existing?.categoryId || '',
  });

  React.useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        description: existing.description || '',
        price: existing.price?.toString() || '',
        stock: existing.stock?.toString() || '',
        categoryId: existing.categoryId || '',
      });
    }
  }, [existing]);

  const handleSubmit = () => {
    if (!form.title || !form.price || !form.stock) {
      Alert.alert('Eksik Bilgi', 'Başlık, fiyat ve stok zorunludur.');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId: form.categoryId,
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      Alert.alert(
        isEdit ? 'Güncellendi' : 'Eklendi',
        isEdit ? 'Ürün başarıyla güncellendi.' : 'Ürün onay için iletildi.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
    };

    const onError = () => Alert.alert('Hata', 'İşlem başarısız oldu.');

    if (isEdit) update.mutate(payload, { onSuccess, onError });
    else create.mutate(payload, { onSuccess, onError });
  };

  const isPending = create.isPending || update.isPending;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1">
        <View className="px-6 mt-4 mb-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white">
            {isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün'}
          </Text>
          <View className="w-10" />
        </View>

        <View className="px-6">
          {/* Başlık */}
          <View className="mb-4">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Ürün Adı *</Text>
            <TextInput
              value={form.title}
              onChangeText={(v) => setForm({ ...form, title: v })}
              placeholder="Ürün adı"
              placeholderTextColor="#475569"
              className="bg-surface text-white p-4 rounded-2xl border border-white/10"
            />
          </View>

          {/* Açıklama */}
          <View className="mb-4">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Açıklama</Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholder="Ürün özellikleri, kullanımı..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="bg-surface text-white p-4 rounded-2xl border border-white/10"
              style={{ minHeight: 120 }}
            />
          </View>

          {/* Fiyat & Stok */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Fiyat (₺) *</Text>
              <TextInput
                value={form.price}
                onChangeText={(v) => setForm({ ...form, price: v })}
                placeholder="0"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                className="bg-surface text-white p-4 rounded-2xl border border-white/10"
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Stok *</Text>
              <TextInput
                value={form.stock}
                onChangeText={(v) => setForm({ ...form, stock: v })}
                placeholder="0"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                className="bg-surface text-white p-4 rounded-2xl border border-white/10"
              />
            </View>
          </View>

          {/* Kategori */}
          <View className="mb-6">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Kategori ID</Text>
            <TextInput
              value={form.categoryId}
              onChangeText={(v) => setForm({ ...form, categoryId: v })}
              placeholder="Kategori seçin"
              placeholderTextColor="#475569"
              className="bg-surface text-white p-4 rounded-2xl border border-white/10"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className="bg-accent py-4 rounded-2xl items-center mb-3"
          >
            {isPending
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-black uppercase tracking-widest">
                  {isEdit ? 'Değişiklikleri Kaydet' : 'Ürünü Yayınla'}
                </Text>}
          </TouchableOpacity>

          <Text className="text-slate-500 text-[10px] text-center mb-10">
            {isEdit
              ? 'Güncellenen ürün hemen yayına girer.'
              : 'Yeni ürünler onaydan geçtikten sonra yayınlanır.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
