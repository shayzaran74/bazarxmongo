import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

export default function CreateSurplusScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'NEW',
    categoryId: ''
  });

  const handleCreate = async () => {
    if (!form.title || !form.price) {
      Alert.alert('Hata', 'Lütfen başlık ve tahmini değer alanlarını doldurun.');
      return;
    }

    setLoading(true);
    try {
      await api.post('surplus', {
        ...form,
        price: parseFloat(form.price),
        status: 'ACTIVE'
      });
      Alert.alert('Başarılı', 'İlanınız başarıyla oluşturuldu.', [
        { text: 'Tamam', onPress: () => router.push('/trade/surplus') }
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'İlan oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-white">Yeni Takas İlanı</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Photo Upload Placeholder */}
        <TouchableOpacity className="w-full h-48 bg-surface rounded-3xl border-2 border-white/5 border-dashed items-center justify-center mb-8">
          <View className="bg-accent/10 p-4 rounded-full mb-2">
            <Ionicons name="camera-outline" size={32} color="#3B82F6" />
          </View>
          <Text className="text-white font-bold text-sm">Fotoğraf Ekle</Text>
          <Text className="text-slate-500 text-[10px] mt-1">En fazla 5 fotoğraf yükleyebilirsiniz</Text>
        </TouchableOpacity>

        <View className="space-y-6">
          <View>
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">İlan Başlığı</Text>
            <TextInput
              className="bg-surface text-white px-5 py-4 rounded-2xl border border-white/5 font-bold"
              placeholder="Örn: MacBook Air M2"
              placeholderTextColor="#475569"
              value={form.title}
              onChangeText={(t) => setForm({...form, title: t})}
            />
          </View>

          <View>
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Açıklama</Text>
            <TextInput
              className="bg-surface text-white px-5 py-4 rounded-2xl border border-white/5 font-bold"
              placeholder="Ürününüzün durumu ve takas tercihlerinizi yazın..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={form.description}
              onChangeText={(t) => setForm({...form, description: t})}
            />
          </View>

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Tahmini Değer (₺)</Text>
              <TextInput
                className="bg-surface text-white px-5 py-4 rounded-2xl border border-white/5 font-bold"
                placeholder="0"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(t) => setForm({...form, price: t})}
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Durum</Text>
              <View className="flex-row bg-surface p-1 rounded-2xl border border-white/5">
                <TouchableOpacity 
                  onPress={() => setForm({...form, condition: 'NEW'})}
                  className={`flex-1 py-3 rounded-xl items-center ${form.condition === 'NEW' ? 'bg-accent' : ''}`}
                >
                  <Text className={`text-[10px] font-black ${form.condition === 'NEW' ? 'text-white' : 'text-slate-500'}`}>SIFIR</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setForm({...form, condition: 'USED'})}
                  className={`flex-1 py-3 rounded-xl items-center ${form.condition === 'USED' ? 'bg-accent' : ''}`}
                >
                  <Text className={`text-[10px] font-black ${form.condition === 'USED' ? 'text-white' : 'text-slate-500'}`}>2. EL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleCreate}
          disabled={loading}
          className="bg-accent w-full py-5 rounded-2xl items-center justify-center mt-12 shadow-lg shadow-accent/30"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-xs uppercase tracking-widest">İlanı Yayınla</Text>}
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
