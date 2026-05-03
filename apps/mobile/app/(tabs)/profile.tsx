// apps/mobile/app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'expo-router'

export default function ProfileTab() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PROFİL</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Misafir'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📦 Siparişlerim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📍 Adreslerim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/takas')}>
          <Text style={styles.menuText}>⇄ Takas Paneli</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={[styles.menuText, { color: '#EF4444' }]}>🚪 Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#002444' },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  card: { margin: 20, backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#002444', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  name: { fontSize: 18, fontWeight: '800', color: '#002444' },
  email: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  menu: { marginHorizontal: 20, gap: 2 },
  menuItem: { backgroundColor: '#fff', padding: 18, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  menuText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  logoutItem: { marginTop: 12, backgroundColor: '#FEF2F2' },
})
