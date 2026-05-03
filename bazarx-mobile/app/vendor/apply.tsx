import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApplyVendor, type ApplyVendorDto } from '../../hooks/useVendor';

export default function VendorApplyScreen() {
  const router = useRouter();
  const apply = useApplyVendor();

  const [form, setForm] = useState<ApplyVendorDto>({
    companyName: '',
    taxNumber: '',
    phone: '',
    city: '',
    address: '',
    description: '',
  });

  const update = (k: keyof ApplyVendorDto, v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = () => {
    if (!form.companyName || !form.taxNumber || !form.phone || !form.city) {
      Alert.alert('Eksik Bilgi', 'Firma adı, vergi no, telefon ve şehir zorunludur.');
      return;
    }
    apply.mutate(form, {
      onSuccess: () => {
        Alert.alert(
          'Başvuru Alındı',
          'Mağaza başvurunuz onay için iletildi. 24-48 saat içinde sonuçlanacaktır.',
          [{ text: 'Tamam', onPress: () => router.back() }]
        );
      },
      onError: () => Alert.alert('Hata', 'Başvuru gönderilemedi. Daha sonra tekrar deneyin.'),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 mt-4 mb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface rounded-2xl items-center justify-center border border-white/5">
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white">Satıcı Ol</Text>
          <View className="w-10" />
        </View>

        {/* Hero */}
        <View className="px-6 mb-6">
          <View className="bg-surface p-6 rounded-3xl border border-accent/30 items-center">
            <View className="w-20 h-20 bg-accent/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="storefront" size={36} color="#3B82F6" />
            </View>
            <Text className="text-white text-xl font-black mb-2 text-center">BazarX'te Sat</Text>
            <Text className="text-slate-400 text-xs text-center leading-relaxed">
              Mağazanı aç, milyonlarca müşteriye ulaş. Düşük komisyon, hızlı ödeme.
            </Text>
          </View>
        </View>

        {/* Form */}
        <View className="px-6">
          {[
            { key: 'companyName' as const, label: 'Firma Adı *',     placeholder: 'BazarX Ticaret A.Ş.', icon: 'business-outline' },
            { key: 'taxNumber' as const,   label: 'Vergi No *',       placeholder: '1234567890',          icon: 'document-text-outline' },
            { key: 'phone' as const,       label: 'Telefon *',        placeholder: '+90 555 555 55 55',   icon: 'call-outline' },
            { key: 'city' as const,        label: 'Şehir *',          placeholder: 'İstanbul',            icon: 'location-outline' },
            { key: 'address' as const,     label: 'Adres',            placeholder: 'Tam adres',           icon: 'home-outline' },
          ].map((f) => (
            <View key={f.key} className="mb-4">
              <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{f.label}</Text>
              <View className="bg-surface flex-row items-center px-4 py-3 rounded-2xl border border-white/10">
                <Ionicons name={f.icon as any} size={18} color="#64748B" />
                <TextInput
                  value={form[f.key] as string}
                  onChangeText={(v) => update(f.key, v)}
                  placeholder={f.placeholder}
                  placeholderTextColor="#475569"
                  className="flex-1 ml-3 text-white"
                />
              </View>
            </View>
          ))}

          {/* Açıklama */}
          <View className="mb-6">
            <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">İşletme Açıklaması</Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => update('description', v)}
              placeholder="İşletmeniz ve sattığınız ürünler hakkında..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-surface text-white p-4 rounded-2xl border border-white/10"
              style={{ minHeight: 100 }}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={apply.isPending}
            className="bg-accent py-4 rounded-2xl items-center mb-3"
          >
            {apply.isPending
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-black uppercase tracking-widest">Başvuruyu Gönder</Text>}
          </TouchableOpacity>

          <Text className="text-slate-500 text-[10px] text-center mb-10">
            Başvurunuz 24-48 saat içinde onaylanır. KDV mükellefi olmanız gereklidir.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
