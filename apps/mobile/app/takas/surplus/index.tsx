// apps/mobile/app/takas/surplus/index.tsx
import { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Image, ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSurplus } from '@/hooks/useSurplus'
import { MINIO_BASE } from '@/constants/api'
import type { SurplusItem } from '@/types/surplus'

export default function SurplusListScreen() {
  const router = useRouter()
  const { items, loading, total, fetchItems } = useSurplus()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchItems({ q: search, page })
  }, [search, page])

  const getImage = (item: SurplusItem) => {
    const img = item.images?.[0]
    if (!img) return null
    return img.startsWith('http') ? img : `${MINIO_BASE}/${img}`
  }

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>TAKAS HAVUZU</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/takas/surplus/create')}>
          <Text style={styles.addBtnText}>+ İLAN</Text>
        </TouchableOpacity>
      </View>

      {/* Arama */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün, hizmet veya firma ara..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={(v) => { setSearch(v); setPage(1) }}
        />
      </View>

      <Text style={styles.total}>{total} aktif ilan</Text>

      {/* Liste */}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchItems({ q: search, page })} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/takas/surplus/${item.id}`)}
          >
            <Image
              source={{ uri: getImage(item) || 'https://via.placeholder.com/200' }}
              style={styles.image}
            />
            <View style={styles.cardBody}>
              <Text style={styles.category} numberOfLines={1}>
                {item.categoryName || 'GENEL'}
              </Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.price}>
                {new Intl.NumberFormat('tr-TR').format(item.unitPrice)} ₺
              </Text>
              <Text style={styles.company} numberOfLines={1}>
                {item.company?.name || 'Kurumsal Satıcı'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>İlan bulunamadı</Text>
            </View>
          ) : null
        }
        ListFooterComponent={loading ? <ActivityIndicator color="#002444" style={{ marginVertical: 20 }} /> : null}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#002444' },
  back: { padding: 4 },
  backText: { color: '#fff', fontSize: 22 },
  title: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  addBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  searchBox: { margin: 16, backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { height: 44, fontSize: 14, color: '#0F172A' },
  total: { paddingHorizontal: 16, fontSize: 11, color: '#94A3B8', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#F1F5F9' },
  cardBody: { padding: 12 },
  category: { fontSize: 9, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#002444', lineHeight: 18 },
  price: { fontSize: 15, fontWeight: '900', color: '#002444', marginTop: 6 },
  company: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94A3B8', fontWeight: '600' },
})
