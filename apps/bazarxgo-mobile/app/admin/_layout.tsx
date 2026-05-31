import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { View, ActivityIndicator } from 'react-native';

// RBAC: Sadece ADMIN ve SUPER_ADMIN erişebilir
export default function AdminLayout() {
  const { data, isLoading } = useQuery({
    queryKey: ['profile-me'],
    queryFn: async () => {
      const res = await api.get('auth/me');
      return res.data;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000814', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#3B82F6" />
      </View>
    );
  }

  const user = data?.data || data;
  const role = user?.role;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  if (!isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="vendors" />
      <Stack.Screen name="products" />
      <Stack.Screen name="orders" />
    </Stack>
  );
}
