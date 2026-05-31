import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function AddressesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // 1. Adresleri Çekme
  const { data: response, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data;
    }
  });

  const addresses = response?.data || response || [];

  // 2. Adres Ekleme Mutation
  const addMutation = useMutation({
    mutationFn: async (newAddr: any) => {
      const res = await api.post('/addresses', newAddr);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      // Reset form
      setNewTitle(''); setFirstName(''); setLastName(''); setPhone('');
      setNewCity(''); setNewDistrict(''); setNewAddress('');
      setModalVisible(false);
      Alert.alert('Başarılı', 'Adresiniz başarıyla kaydedildi.');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Adres kaydedilemedi.';
      Alert.alert('Hata', Array.isArray(msg) ? msg[0] : msg);
    }
  });

  // 3. Adres Silme Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    }
  });

  const handleAddAddress = () => {
    if (!newTitle || !firstName || !lastName || !phone || !newCity || !newDistrict || !newAddress) {
      Alert.alert('Uyarı', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    addMutation.mutate({
      title: newTitle,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      addressLine1: newAddress,
      city: newCity,
      district: newDistrict,
      isDefault: false
    });
  };

  const deleteAddress = (id: string | number) => {
    Alert.alert('Adresi Sil', 'Bu adresi silmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="mt-6 mb-8 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
              onPress={() => router.back()}
            >
              <Text className="text-white">←</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-3xl font-black text-white">Adreslerim</Text>
              <Text className="text-xs font-bold text-slate-400 mt-1">Teslimat noktalarınız</Text>
            </View>
          </View>
        </View>

        {/* Address List */}
        <View className="space-y-4 mb-8">
          {isLoading ? (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : Array.isArray(addresses) && addresses.map((item: any) => (
            <View key={item.id} className="bg-surface p-5 rounded-3xl border border-white/5 relative">
              {deleteMutation.isPending && deleteMutation.variables === item.id && (
                <View className="absolute inset-0 bg-surface/80 rounded-3xl items-center justify-center z-10">
                  <ActivityIndicator color="#EF4444" />
                </View>
              )}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center bg-accent/20 px-3 py-1.5 rounded-lg">
                  <Ionicons name="location" size={12} color="#3B82F6" />
                  <Text className="text-accent font-black text-[10px] uppercase tracking-widest ml-1">
                    {item.title}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteAddress(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Text className="text-white font-bold text-sm mb-1">{item.addressLine1}</Text>
              <Text className="text-slate-400 text-xs">{item.district}, {item.city}</Text>
              <Text className="text-slate-500 text-[10px] mt-2 font-bold">{item.firstName} {item.lastName} - {item.phone}</Text>
            </View>
          ))}

          {!isLoading && addresses.length === 0 && (
            <View className="py-10 items-center justify-center bg-surface rounded-3xl border border-white/5 border-dashed">
              <Ionicons name="map-outline" size={40} color="#475569" />
              <Text className="text-slate-400 mt-4 font-bold">Kayıtlı adresiniz bulunmuyor.</Text>
            </View>
          )}
        </View>

        {/* Add Button */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl items-center justify-center flex-row mb-10"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">Yeni Adres Ekle</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/80"
        >
          <View className="bg-surface rounded-t-[40px] p-8 border-t border-white/10 h-[85%]">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-white">Yeni Adres</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-white/10 p-2 rounded-full">
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-5">
              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adres Başlığı *</Text>
                <TextInput
                  className="w-full bg-[#001A30] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
                  placeholder="Örn: Ev, İş, Depo"
                  placeholderTextColor="#475569"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ad *</Text>
                  <TextInput
                    className="w-full bg-[#001A30] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
                    placeholder="Ad"
                    placeholderTextColor="#475569"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Soyad *</Text>
                  <TextInput
                    className="w-full bg-[#001A30] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
                    placeholder="Soyad"
                    placeholderTextColor="#475569"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefon *</Text>
                <TextInput
                  className="w-full bg-[#001A30] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
                  placeholder="05xx xxx xx xx"
                  placeholderTextColor="#475569"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Şehir *</Text>
                  <TextInput
                    className="w-full bg-[#001A30] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
                    placeholder="İl"
                    placeholderTextColor="#475569"
                    value={newCity}
                    onChangeText={setNewCity}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">İlçe *</Text>
                  <TextInput
                    className="w-full bg-[#001A30] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
                    placeholder="İlçe"
                    placeholderTextColor="#475569"
                    value={newDistrict}
                    onChangeText={setNewDistrict}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Açık Adres *</Text>
                <TextInput
                  className="w-full bg-[#001A30] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent"
                  placeholder="Mahalle, Sokak, No, Daire..."
                  placeholderTextColor="#475569"
                  multiline
                  numberOfLines={3}
                  value={newAddress}
                  onChangeText={setNewAddress}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              <TouchableOpacity 
                onPress={handleAddAddress}
                disabled={addMutation.isPending}
                className={`w-full py-5 rounded-2xl items-center justify-center mt-4 mb-20 ${addMutation.isPending ? 'bg-accent/50' : 'bg-accent'}`}
              >
                {addMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-black text-xs uppercase tracking-widest">Adresi Kaydet</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
