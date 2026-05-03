import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { login } = useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Normalde burada authentication.accessToken backend'e gönderilir ve BazarX JWT token'ı alınır
      console.log('Google Auth Success:', authentication?.accessToken);
      // Backend entegrasyonu hazır olana kadar uyarı gösterelim:
      alert('Google ile giriş başarılı (Backend entegrasyonu bekleniyor)');
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Endpoint is same as web: auth/login
      const res = await api.post('auth/login', { email, password });
      
      if (res.data.success && res.data.data.accessToken) {
        const userData = res.data.data.user;
        await login(res.data.data.accessToken, userData);

        // Rol bazlı yönlendirme — sadece login anında bir kez
        const role = userData?.role;
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          router.replace('/admin/dashboard');
        } else if (role === 'VENDOR') {
          router.replace('/vendor/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setError('Giriş başarısız, lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <View className="flex-1 justify-center px-8">
        <View className="mb-12">
          <Text className="text-4xl font-black text-white mb-2">BazarX</Text>
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            B2B Ticari Takas Ekosistemi
          </Text>
        </View>

        <View className="space-y-6">
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
              placeholder="••••••••"
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
            onPress={handleLogin}
            disabled={loading}
            className={`w-full py-5 rounded-2xl items-center justify-center mt-4 ${loading ? 'bg-accent/50' : 'bg-accent'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">Giriş Yap</Text>
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

        <View className="mt-6 flex-row justify-center items-center">
          <Text className="text-slate-400 text-xs">Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-accent text-xs font-bold">Hemen Kaydolun</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
