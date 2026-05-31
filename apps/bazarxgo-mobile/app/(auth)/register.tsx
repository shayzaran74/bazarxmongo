import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { api } from '../../lib/api';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace with actual ID later
    androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Replace with actual ID later
  });

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('auth/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      if (res.data.success) {
        // Kayıt başarılı, doğrulama ekranına e-posta ile geçiş yap
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email }
        });
      } else {
        setError('Kayıt başarısız, lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bu e-posta adresi kullanımda olabilir.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-surface justify-center px-8 items-center">
        <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">✨</Text>
        </View>
        <Text className="text-2xl font-black text-white mb-2 text-center">Hesabınız Oluşturuldu</Text>
        <Text className="text-slate-400 text-center mb-10 leading-relaxed">
          Giriş yaparak BazarX ekosisteminin tüm özelliklerinden faydalanabilirsiniz.
        </Text>
        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/login')}
          className="w-full py-5 bg-accent rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-black text-xs uppercase tracking-widest">Giriş Ekranına Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
        <TouchableOpacity 
          className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mb-8"
          onPress={() => router.back()}
        >
          <Text className="text-white">←</Text>
        </TouchableOpacity>

        <View className="mb-10">
          <Text className="text-3xl font-black text-white mb-2">Aramıza Katılın</Text>
          <Text className="text-sm font-bold text-slate-400">
            Dakikalar içinde hesabınızı oluşturun.
          </Text>
        </View>

        <View className="space-y-5">
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Adınız</Text>
              <TextInput
                className="w-full bg-[#112A45] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#1A3555] transition-colors"
                placeholder="Örn: Ali"
                placeholderTextColor="#475569"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Soyadınız</Text>
              <TextInput
                className="w-full bg-[#112A45] text-white px-5 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#1A3555] transition-colors"
                placeholder="Örn: Yılmaz"
                placeholderTextColor="#475569"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-Posta</Text>
            <TextInput
              className="w-full bg-[#112A45] text-white px-6 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#1A3555] transition-colors"
              placeholder="sirket@email.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Şifre</Text>
            <TextInput
              className="w-full bg-[#112A45] text-white px-6 py-4 rounded-2xl border border-white/5 font-bold focus:border-accent focus:bg-[#1A3555] transition-colors"
              placeholder="En az 6 karakter"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text className="text-red-400 text-xs font-bold">{error}</Text>
          ) : null}

          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            className={`w-full py-5 rounded-2xl items-center justify-center mt-6 ${loading ? 'bg-accent/50' : 'bg-accent'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">Ücretsiz Kaydol</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Google OAuth Button */}
        <View className="mt-8 mb-4">
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-white/10" />
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mx-4">VEYA</Text>
            <View className="flex-1 h-[1px] bg-white/10" />
          </View>

          <TouchableOpacity 
            disabled={!request}
            onPress={() => promptAsync()}
            className="w-full py-4 rounded-2xl items-center justify-center bg-white/5 border border-white/10 flex-row space-x-3"
          >
            <Text className="text-lg">🇬</Text>
            <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">Google İle Devam Et</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
