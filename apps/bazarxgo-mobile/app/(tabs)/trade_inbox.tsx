import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface TradeOffer {
  id: string;
  status: string;
  fromCompany?: { name: string };
  toCompany?: { name: string };
  targetItem?: { title: string; images?: string[] };
  cashAmount?: number;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:         { label: 'BEKLEMEDE',     color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.1)' },
  ACCEPTED:        { label: 'KABUL EDİLDİ',  color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
  REJECTED:        { label: 'REDDEDİLDİ',    color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  COUNTER_OFFERED: { label: 'KARŞI TEKLİF',  color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)' },
  CANCELLED:       { label: 'İPTAL EDİLDİ',  color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' },
  COMPLETED:       { label: 'TAMAMLANDI',    color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' },
};

export default function TradeInboxScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'RECEIVED' | 'SENT'>('RECEIVED');

  const { data: response, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ['trade-offers', activeTab],
    queryFn: async () => {
      // /api/v1/offers/my?type=received|sent  (web ile aynı endpoint)
      const res = await api.get('offers/my', {
        params: { type: activeTab.toLowerCase() },
      });
      return res.data;
    },
    retry: false,
  });

  // Backend hem array hem {data: array} dönebilir
  const offers: TradeOffer[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  const getStatus = (s: string) => STATUS_MAP[s] || { label: s || 'BEKLEMEDE', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' };

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.title}>Takas Kutusu</Text>
        <TouchableOpacity
          onPress={() => router.push('/trade/surplus')}
          style={styles.searchBtn}
        >
          <Ionicons name="search" size={14} color="#3B82F6" />
          <Text style={styles.searchBtnText}>İlanlar</Text>
        </TouchableOpacity>
      </View>

      {/* Sekmeler */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setActiveTab('RECEIVED')}
          style={[styles.tab, activeTab === 'RECEIVED' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'RECEIVED' && styles.tabTextActive]}>GELEN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('SENT')}
          style={[styles.tab, activeTab === 'SENT' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'SENT' && styles.tabTextActive]}>GİDEN</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#3B82F6" />}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#3B82F6" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="warning-outline" size={36} color="#EF4444" />
            <Text style={styles.errorText}>Teklifler yüklenemedi.</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : offers.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Ionicons name="mail-unread-outline" size={36} color="#475569" />
            </View>
            <Text style={styles.emptyText}>
              {activeTab === 'RECEIVED' ? 'Henüz gelen teklif yok.' : 'Henüz gönderdiğiniz teklif yok.'}
            </Text>
          </View>
        ) : (
          <View>
            {offers.map((offer) => {
              const status = getStatus(offer.status);
              const company = activeTab === 'RECEIVED' ? offer.fromCompany : offer.toCompany;
              const initial = company?.name?.charAt(0)?.toUpperCase() || 'U';
              const itemImage = offer.targetItem?.images?.[0];

              return (
                <TouchableOpacity
                  key={offer.id}
                  onPress={() => router.push(`/trade/offer/${offer.id}`)}
                  style={styles.card}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initial}</Text>
                      </View>
                      <View>
                        <Text style={styles.companyName}>{company?.name || 'Kullanıcı'}</Text>
                        <Text style={styles.dateText}>
                          {new Date(offer.createdAt).toLocaleDateString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>

                  <View style={styles.itemRow}>
                    <View style={styles.itemImageBox}>
                      {itemImage ? (
                        <Image source={{ uri: itemImage }} style={styles.itemImage} />
                      ) : (
                        <Ionicons name="cube-outline" size={16} color="#334155" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {offer.targetItem?.title || 'Ürün'}
                      </Text>
                      <Text style={styles.itemPrice}>
                        ₺{Number(offer.cashAmount || 0).toLocaleString('tr-TR')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 80 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 24, marginTop: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FFEDD5' },
  searchBtnText: { color: '#F97316', fontWeight: '700', fontSize: 11, marginLeft: 6 },
  tabs: { marginHorizontal: 24, flexDirection: 'row', marginBottom: 24, padding: 4, backgroundColor: '#F1F5F9', borderRadius: 16 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#F97316', shadowColor: '#F97316', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  tabText: { fontWeight: '700', fontSize: 11, color: '#64748B' },
  tabTextActive: { color: '#fff' },
  scroll: { flex: 1, paddingHorizontal: 24 },
  center: { paddingVertical: 80, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWith: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  emptyText: { color: '#64748B', fontWeight: '700', textAlign: 'center' },
  errorText: { color: '#EF4444', fontWeight: '700', marginTop: 12 },
  retryBtn: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FEE2E2', borderRadius: 12 },
  retryBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 32, height: 32, backgroundColor: '#F8FAFC', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  avatarText: { color: '#F97316', fontSize: 11, fontWeight: '900' },
  companyName: { color: '#1E293B', fontWeight: '700', fontSize: 12 },
  dateText: { color: '#94A3B8', fontSize: 9 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: '900' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  itemImageBox: { width: 40, height: 40, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  itemImage: { width: '100%', height: '100%' },
  itemTitle: { color: '#1E293B', fontWeight: '700', fontSize: 11 },
  itemPrice: { color: '#F97316', fontWeight: '900', fontSize: 11 },
});
