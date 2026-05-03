// apps/mobile/app/(tabs)/takas.tsx
import { useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useTradeOffers } from '@/hooks/useSurplus'
import type { TradeOffer } from '@/types/surplus'
import { MINIO_BASE } from '@/constants/api'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Beklemede',
  ACCEPTED: 'Kabul Edildi',
  REJECTED: 'Reddedildi',
  COUNTER_OFFERED: 'Karşı Teklif',
  EXPIRED: 'Süresi Doldu',
  CANCELLED: 'İptal',
  COMPLETED: 'Tamamlandı',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#F59E0B',
  ACCEPTED: '#10B981',
  REJECTED: '#EF4444',
  COUNTER_OFFERED: '#6366F1',
  EXPIRED: '#9CA3AF',
  CANCELLED: '#9CA3AF',
  COMPLETED: '#10B981',
}

export default function TakasTab() {
  const router = useRouter()
  const { offers, loading, activeTab, setActiveTab, fetchMyOffers } = useTradeOffers()

  useEffect(() => { fetchMyOffers() }, [activeTab])

  const getImage = (offer: TradeOffer) => {
    const item = activeTab === 'received' ? offer.offeredItem : offer.requestedItem
    const img = item?.images?.[0]
    if (!img) return null
    return img.startsWith('http') ? img : `${MINIO_BASE}/${img}`
  }

  const getPartnerName = (offer: TradeOffer) =>
    activeTab === 'received' ? offer.fromCompany?.name : offer.toCompany?.name

  const handlePress = (offer: TradeOffer) => {
    if (offer.status === 'ACCEPTED' && offer.swapSession?.id) {
      router.push(`/takas/swap/${offer.swapSession.id}`)
    } else {
      router.push(`/takas/offer/${offer.id}`)
    }
  }

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>TAKAS PANELİ</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/takas/surplus')}>
          <Text style={styles.newBtnText}>+ YENİ İLAN</Text>
        </TouchableOpacity>
      </View>

      {/* Sekmeler */}
      <View style={styles.tabs}>
        {(['received', 'sent'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'received' ? 'GELEN' : 'GİDEN'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {loading && offers.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#002444" />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMyOffers} />}
          renderItem={({ item: offer }) => (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(offer)}>
              <Image
                source={{ uri: getImage(offer) || 'https://via.placeholder.com/64' }}
                style={styles.image}
              />
              <View style={styles.cardBody}>
                <Text style={styles.partnerName}>{getPartnerName(offer)}</Text>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {activeTab === 'received'
                    ? offer.offeredItem?.title
                    : offer.requestedItem?.title}
                </Text>
                <Text style={styles.date}>
                  {new Date(offer.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[offer.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[offer.status] }]}>
                  {STATUS_LABEL[offer.status] || offer.status}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Henüz teklif bulunmuyor</Text>
              <TouchableOpacity onPress={() => router.push('/takas/surplus')}>
                <Text style={styles.emptyLink}>Takas havuzunu incele →</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#002444' },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  newBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  newBtnText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: '#002444' },
  tabText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1 },
  tabTextActive: { color: '#002444' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  image: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F1F5F9' },
  cardBody: { flex: 1, marginLeft: 12 },
  partnerName: { fontSize: 13, fontWeight: '800', color: '#002444' },
  itemTitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  date: { fontSize: 10, color: '#CBD5E1', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  emptyLink: { fontSize: 13, color: '#3B82F6', fontWeight: '700' },
})
