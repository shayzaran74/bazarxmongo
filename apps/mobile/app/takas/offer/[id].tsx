// apps/mobile/app/takas/offer/[id].tsx
import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal, Image,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTradeOffers } from '@/hooks/useSurplus'
import { MINIO_BASE } from '@/constants/api'
import type { TradeOffer } from '@/types/surplus'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:        { label: 'Beklemede', color: '#F59E0B' },
  ACCEPTED:       { label: 'Kabul Edildi', color: '#10B981' },
  REJECTED:       { label: 'Reddedildi', color: '#EF4444' },
  COUNTER_OFFERED:{ label: 'Karşı Teklif', color: '#6366F1' },
  EXPIRED:        { label: 'Süresi Doldu', color: '#9CA3AF' },
  CANCELLED:      { label: 'İptal', color: '#9CA3AF' },
  COMPLETED:      { label: 'Tamamlandı', color: '#10B981' },
}

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { fetchOffer, acceptOffer, rejectOffer, counterOffer } = useTradeOffers()

  const [offer, setOffer] = useState<TradeOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCounterModal, setShowCounterModal] = useState(false)
  const [counterMessage, setCounterMessage] = useState('')
  const [counterCash, setCounterCash] = useState('')

  useEffect(() => {
    fetchOffer(id).then((data) => { setOffer(data); setLoading(false) })
  }, [id])

  const getImage = (offer: TradeOffer, side: 'offered' | 'requested') => {
    const item = side === 'offered' ? offer.offeredItem : offer.requestedItem
    const img = item?.images?.[0]
    if (!img) return 'https://via.placeholder.com/120'
    return img.startsWith('http') ? img : `${MINIO_BASE}/${img}`
  }

  const handleAccept = async () => {
    Alert.alert('Teklifi Kabul Et', 'Takas süreci başlayacak. Emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Kabul Et',
        onPress: async () => {
          setActionLoading(true)
          try {
            const sessionId = await acceptOffer(id)
            if (sessionId) {
              router.replace(`/takas/swap/${sessionId}`)
            } else {
              Alert.alert('Hata', 'Swap session oluşturulamadı.')
            }
          } catch {
            Alert.alert('Hata', 'Teklif kabul edilemedi.')
          } finally {
            setActionLoading(false)
          }
        },
      },
    ])
  }

  const handleReject = async () => {
    Alert.alert('Teklifi Reddet', 'Bu teklifi reddetmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Reddet',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true)
          try {
            await rejectOffer(id)
            router.back()
          } catch {
            Alert.alert('Hata', 'İşlem gerçekleştirildi.')
          } finally {
            setActionLoading(false)
          }
        },
      },
    ])
  }

  const handleCounter = async () => {
    setActionLoading(true)
    try {
      await counterOffer(id, {
        cashDifference: counterCash ? Number(counterCash) : 0,
        message: counterMessage,
      })
      setShowCounterModal(false)
      Alert.alert('Karşı Teklif Gönderildi', 'Karşı firma yanıt verdiğinde bildirim alacaksınız.')
      router.back()
    } catch {
      Alert.alert('Hata', 'Karşı teklif gönderilemedi.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#002444" /></View>
  }
  if (!offer) {
    return <View style={styles.centered}><Text style={styles.errorText}>Teklif bulunamadı</Text></View>
  }

  const status = STATUS_MAP[offer.status] || { label: offer.status, color: '#9CA3AF' }
  const isPending = offer.status === 'PENDING'
  const isAccepted = offer.status === 'ACCEPTED'

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Başlık */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>TEKLİF DETAYI</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Takas özeti */}
          <View style={styles.swapCard}>
            <View style={styles.swapSide}>
              <Image source={{ uri: getImage(offer, 'offered') }} style={styles.itemImage} />
              <Text style={styles.itemLabel}>{offer.offeredItem?.title}</Text>
              <Text style={styles.companyLabel}>{offer.fromCompany?.name}</Text>
            </View>

            <View style={styles.swapIcon}>
              <Text style={styles.swapIconText}>⇄</Text>
              {offer.cashDifference !== undefined && offer.cashDifference !== 0 && (
                <Text style={[styles.cashDiff, { color: offer.cashDifference > 0 ? '#10B981' : '#EF4444' }]}>
                  {offer.cashDifference > 0 ? '+' : ''}{new Intl.NumberFormat('tr-TR').format(offer.cashDifference)} ₺
                </Text>
              )}
            </View>

            <View style={styles.swapSide}>
              <Image source={{ uri: getImage(offer, 'requested') }} style={styles.itemImage} />
              <Text style={styles.itemLabel}>{offer.requestedItem?.title}</Text>
              <Text style={styles.companyLabel}>{offer.toCompany?.name}</Text>
            </View>
          </View>

          {/* Mesaj */}
          {offer.message && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MESAJ</Text>
              <Text style={styles.messageText}>"{offer.message}"</Text>
            </View>
          )}

          {/* Tarih */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TARİH</Text>
            <Text style={styles.dateText}>
              {new Date(offer.createdAt).toLocaleString('tr-TR')}
            </Text>
          </View>

          {/* Kabul edilip swap session varsa */}
          {isAccepted && offer.swapSession?.id && (
            <TouchableOpacity
              style={styles.swapSessionBtn}
              onPress={() => router.push(`/takas/swap/${offer.swapSession!.id}`)}
            >
              <Text style={styles.swapSessionBtnText}>TAKAS SÜRECINE GİT →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Alt butonlar — sadece PENDING */}
      {isPending && (
        <View style={styles.footer}>
          {actionLoading ? (
            <ActivityIndicator color="#002444" />
          ) : (
            <>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                <Text style={styles.rejectBtnText}>REDDET</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setShowCounterModal(true)}>
                <Text style={styles.counterBtnText}>KARŞI TEKLİF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                <Text style={styles.acceptBtnText}>KABUL ET</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Karşı Teklif Modal */}
      <Modal visible={showCounterModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCounterModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>KARŞI TEKLİF</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Nakit Fark Güncelle (₺)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Mevcut nakit farkı değiştirin"
                value={counterCash}
                onChangeText={setCounterCash}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Mesaj</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                multiline
                placeholder="Karşı teklifinizi açıklayın..."
                value={counterMessage}
                onChangeText={setCounterMessage}
              />
            </View>
            <TouchableOpacity
              style={[styles.submitBtn, actionLoading && { opacity: 0.6 }]}
              onPress={handleCounter}
              disabled={actionLoading}
            >
              {actionLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>KARŞI TEKLİF GÖNDER</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#94A3B8', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#002444' },
  back: { padding: 4 },
  backText: { color: '#fff', fontSize: 22 },
  title: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  content: { padding: 20 },
  swapCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  swapSide: { flex: 1, alignItems: 'center', gap: 8 },
  itemImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#F1F5F9' },
  itemLabel: { fontSize: 12, fontWeight: '700', color: '#002444', textAlign: 'center' },
  companyLabel: { fontSize: 10, color: '#94A3B8', textAlign: 'center' },
  swapIcon: { alignItems: 'center', paddingHorizontal: 12 },
  swapIconText: { fontSize: 24, color: '#3B82F6' },
  cashDiff: { fontSize: 11, fontWeight: '800', marginTop: 4 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 8 },
  messageText: { fontSize: 14, color: '#475569', fontStyle: 'italic', lineHeight: 22 },
  dateText: { fontSize: 13, color: '#64748B' },
  swapSessionBtn: { marginTop: 20, backgroundColor: '#002444', borderRadius: 16, padding: 16, alignItems: 'center' },
  swapSessionBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, gap: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#F1F5F9' },
  rejectBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
  rejectBtnText: { color: '#EF4444', fontSize: 11, fontWeight: '800' },
  counterBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#6366F1', alignItems: 'center' },
  counterBtnText: { color: '#6366F1', fontSize: 11, fontWeight: '800' },
  acceptBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#002444', alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  modal: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 24, backgroundColor: '#002444' },
  modalClose: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  modalContent: { padding: 24, gap: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  submitBtn: { backgroundColor: '#002444', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
})
