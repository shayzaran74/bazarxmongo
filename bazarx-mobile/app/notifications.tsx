import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, clearUnread } = useNotifications();

  useEffect(() => {
    clearUnread();
  }, []);

  const handlePress = (link?: string) => {
    if (!link) return;
    
    // Eğer link admin paneli gibi web yollarını içeriyorsa mobilde gitme
    if (link.startsWith('/admin')) {
      console.warn('Admin links are not supported on mobile');
      return;
    }

    try {
      router.push(link as any);
    } catch (e) {
      console.error('Navigation error:', e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 50 }}>
      {/* HEADER */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)')} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E293B', textTransform: 'uppercase' }}>Bildirimler</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {notifications.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 }}>
            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
            <Text style={{ color: '#94A3B8', marginTop: 15, fontWeight: '700', fontSize: 16 }}>Henüz bildiriminiz yok.</Text>
          </View>
        ) : (
          notifications.map((item, index) => (
            <TouchableOpacity 
              key={`${item.id}-${index}`} 
              style={{ py: 24, borderBottomWidth: 1, borderBottomColor: '#f8fafc', flexDirection: 'row', gap: 15, paddingVertical: 20 }}
              onPress={() => handlePress(item.link)}
            >
              <View style={{ width: 48, height: 48, backgroundColor: '#fff7ed', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons 
                  name={item.type === 'ORDER_STATUS' ? 'cart-outline' : 'notifications-outline'} 
                  size={24} 
                  color="#F97316" 
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontWeight: '900', color: '#1E293B', fontSize: 14 }}>{item.title}</Text>
                  <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700' }}>şimdi</Text>
                </View>
                <Text style={{ color: '#64748B', fontSize: 12, lineHeight: 18 }} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
