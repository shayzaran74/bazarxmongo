import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Tümü');

  const tabs = ['Tümü', 'Siparişler', 'Takas', 'Kampanya'];

  const notifications = [
    {
      id: '1',
      title: 'Siparişiniz Kargoya Verildi',
      message: 'ORD-2026-9821 numaralı siparişiniz kargoya teslim edilmiştir. Kargo takibini sipariş detaylarından yapabilirsiniz.',
      time: '2 saat önce',
      type: 'Siparişler',
      icon: 'cube-outline',
      color: '#3B82F6', // Mavi
      read: false
    },
    {
      id: '2',
      title: 'Yeni Takas Teklifi Aldınız',
      message: 'Kurumsal Laptop Serisi ilanınız için Mega Bilişim firmasından yeni bir takas teklifi geldi.',
      time: '5 saat önce',
      type: 'Takas',
      icon: 'repeat-outline',
      color: '#A855F7', // Mor
      read: false
    },
    {
      id: '3',
      title: 'BazarX Cüzdan Bakiyesi Eklendi',
      message: 'Hesabınıza tanımlanan 500 TL hoş geldin ödülü cüzdanınıza aktarılmıştır.',
      time: '1 gün önce',
      type: 'Kampanya',
      icon: 'wallet-outline',
      color: '#22C55E', // Yeşil
      read: true
    },
    {
      id: '4',
      title: 'Teklifiniz Onaylandı',
      message: 'Göndermiş olduğunuz takas teklifi karşı tarafça kabul edildi. Swap işlemlerine başlayabilirsiniz.',
      time: '2 gün önce',
      type: 'Takas',
      icon: 'checkmark-circle-outline',
      color: '#A855F7',
      read: true
    }
  ];

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'Tümü' || n.type === activeTab
  );

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-6 mt-6 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
            onPress={() => router.back()}
          >
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-black text-white">Bildirimler</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-accent text-xs font-bold">Tümünü Okundu İşaretle</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="px-6 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`mr-4 pb-2 border-b-2 ${activeTab === tab ? 'border-accent' : 'border-transparent'}`}
            >
              <Text className={`font-bold ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="space-y-4">
          {filteredNotifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id}
              className={`p-5 rounded-3xl border ${notification.read ? 'bg-surface border-white/5' : 'bg-[#001A30]/50 border-accent/30'}`}
            >
              <View className="flex-row items-start">
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${notification.color}20` }}
                >
                  <Ionicons name={notification.icon as any} size={24} color={notification.color} />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-white font-bold flex-1 mr-2">{notification.title}</Text>
                    {!notification.read && <View className="w-2 h-2 bg-accent rounded-full mt-1.5" />}
                  </View>
                  <Text className="text-slate-400 text-xs leading-relaxed mb-2">
                    {notification.message}
                  </Text>
                  <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {notification.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {filteredNotifications.length === 0 && (
            <View className="py-20 items-center justify-center">
              <Ionicons name="notifications-off-outline" size={40} color="#475569" />
              <Text className="text-slate-400 mt-4 font-bold text-center">Bu kategoride yeni bildiriminiz yok.</Text>
            </View>
          )}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
