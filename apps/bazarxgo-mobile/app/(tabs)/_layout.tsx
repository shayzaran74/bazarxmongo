import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Sadece VENDOR / ADMIN / SUPER_ADMIN takas sekmesini görür
  const role = user?.role;
  const showTrade = role === 'VENDOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          paddingBottom: 8,
          height: 70,
          position: 'absolute',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trade_inbox"
        options={{
          title: 'Takas',
          href: showTrade ? '/(tabs)/trade_inbox' : null,
          tabBarIcon: ({ color }) => <Ionicons name="swap-horizontal-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Sepetim',
          tabBarIcon: ({ focused }) => (
            <View style={styles.premiumCartContainer}>
              <View style={[
                styles.premiumCartCircle,
                { backgroundColor: focused ? '#2563EB' : '#3B82F6' }
              ]}>
                <Ionicons name="cart" size={28} color="white" />
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            color: '#2563EB',
            fontSize: 10,
            fontWeight: '900',
            marginTop: 15,
          }
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'BazarX Go',
          tabBarIcon: ({ color }) => <Ionicons name="flash-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hesabım',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  premiumCartContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCartCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  }
});
