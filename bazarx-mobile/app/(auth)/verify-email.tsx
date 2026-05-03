import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';

export default function VerifyEmailScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string || 'E-posta adresinize';

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Backend'deki doğrulama endpoint'ini çağırıyoruz
      const res = await api.post('auth/verify-email', { 
        email: params.email,
        code 
      });
      
      if (res.data.success) {
        setSuccess(true);
      } else {
        setError('Doğrulama kodu geçersiz veya süresi dolmuş.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Doğrulama işlemi sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Kodu tekrar gönder
    try {
      await api.post('auth/resend-verification', { email: params.email });
      alert('Doğrulama kodu tekrar gönderildi.');
    } catch (err) {
      alert('Kod gönderilirken hata oluştu.');
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-surface justify-center px-8 items-center">
        <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">✅</Text>
        </View>
        <Text className="text-2xl font-black text-white mb-2 text-center">E-posta Doğrulandı!</Text>
        <Text className="text-slate-400 text-center mb-10 leading-relaxed">
          Hesabınız başarıyla aktive edildi. Şimdi giriş yapabilirsiniz.
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/login')}
          className="w-full py-5 bg-accent rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-black text-xs uppercase tracking-widest">Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <View className="flex-1 justify-center px-8">
        <TouchableOpacity 
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mb-8"
          onPress={() => router.back()}
        >
          <Text className="text-white">←</Text>
        </TouchableOpacity>

        <View className="mb-10">
          <Text className="text-3xl font-black text-white mb-2">E-posta Doğrulama</Text>
          <Text className="text-sm font-bold text-slate-400 leading-relaxed">
            <Text className="text-white">{email}</Text> adresine gönderdiğimiz 6 haneli doğrulama kodunu girin.
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Doğrulama Kodu</Text>
            <TextInput
              className="w-full bg-[#001A30] text-white px-6 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#00203A] transition-colors text-center text-2xl tracking-[0.5em]"
              placeholder="000000"
              placeholderTextColor="#475569"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {error ? (
            <Text className="text-red-400 text-xs font-bold text-center">{error}</Text>
          ) : null}

          <TouchableOpacity 
            onPress={handleVerify}
            disabled={loading}
            className={`w-full py-5 rounded-2xl items-center justify-center mt-2 ${loading ? 'bg-accent/50' : 'bg-accent'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">Doğrula</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-8 flex-row justify-center items-center">
          <Text className="text-slate-400 text-xs">Kodu almadınız mı? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text className="text-accent text-xs font-bold">Tekrar Gönder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
