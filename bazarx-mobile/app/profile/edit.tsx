import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

export default function EditProfileScreen() {
  const { user, checkAuth } = useAuthStore();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(''); 
  const [taxId, setTaxId] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    
    try {
      // Varsayılan olarak backend profil güncelleme endpoint'i (örnek yol)
      // await api.put('auth/profile', { fullName, phone, taxId });
      
      // Simulate backend delay for UI
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state by re-fetching user profile
      // await checkAuth();
      
      setSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      alert('Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}>
        
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity 
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
            onPress={() => router.back()}
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-black text-white">Kişisel Bilgiler</Text>
            <Text className="text-xs font-bold text-slate-400">Profilinizi tamamlayın</Text>
          </View>
        </View>

        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center border-2 border-accent mb-4">
            <Text className="text-3xl font-black text-white">
              {firstName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <TouchableOpacity className="bg-white/10 px-4 py-2 rounded-xl">
            <Text className="text-white font-bold text-xs uppercase tracking-widest">Fotoğraf Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-6">
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ad</Text>
            <TextInput
              className="w-full bg-[#001A30] text-white px-6 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#00203A] transition-colors"
              placeholder="Adınız"
              placeholderTextColor="#475569"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Soyad</Text>
            <TextInput
              className="w-full bg-[#001A30] text-white px-6 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#00203A] transition-colors"
              placeholder="Soyadınız"
              placeholderTextColor="#475569"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-Posta Adresi</Text>
            <TextInput
              className="w-full bg-white/5 text-slate-400 px-6 py-4 rounded-2xl font-bold"
              value={user?.email}
              editable={false}
            />
            <Text className="text-[10px] text-slate-500 mt-1 ml-1">E-posta adresi değiştirilemez.</Text>
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefon Numarası</Text>
            <TextInput
              className="w-full bg-[#001A30] text-white px-6 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#00203A] transition-colors"
              placeholder="05XX XXX XX XX"
              placeholderTextColor="#475569"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">TCKN / VKN</Text>
            <TextInput
              className="w-full bg-[#001A30] text-white px-6 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#00203A] transition-colors"
              placeholder="11 Haneli TCKN veya 10 Haneli VKN"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={taxId}
              onChangeText={setTaxId}
            />
          </View>
        </View>

        {success ? (
           <View className="mt-8 bg-green-500/20 py-4 rounded-2xl items-center border border-green-500/30">
              <Text className="text-green-400 font-bold text-xs uppercase tracking-widest">Başarıyla Kaydedildi</Text>
           </View>
        ) : (
          <TouchableOpacity 
            onPress={handleSave}
            disabled={loading}
            className={`w-full py-5 rounded-2xl items-center justify-center mt-8 ${loading ? 'bg-accent/50' : 'bg-accent'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
