// apps/mobile/app/(tabs)/explore.tsx
import { View, Text, StyleSheet } from 'react-native'

export default function ExploreTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Keşfet</Text>
      <Text style={styles.sub}>Ürün arama — Faz 1'den geliyor</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  text: { fontSize: 24, fontWeight: '900', color: '#002444' },
  sub: { fontSize: 13, color: '#94A3B8', marginTop: 8 },
})
