// apps/mobile/app/takas/surplus/[id].tsx
import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, Image, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSurplus, useTradeOffers } from '@/hooks/useSurplus'
import { useAuthStore } from '@/store/authStore'
import { MINIO_BASE } from '@/constants/api'
import type { SurplusItem } from '@/types/surplus'

export default function SurplusDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const { fetchItem } = useSurplus()
  const { createOffer } = useTradeOffers()

  const [item, setItem] = useState<SurplusItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerLoading, setOfferLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [cashDiff, setCashDiff] = useState('')
  const [myItemId, setMyItemId] = useState('')

  useEffect(() => {
    fetchItem(id).then((data) => { setItem(data); setLoading(false) })
  }, [id])

  const getImage = (surplus: SurplusItem, index = 0) => {
    const img = surplus.images?.[index]
    if (!img) return 'https://via.placeholder.com/400'
    return img.startsWith('http') ? img : `${MINIO_BASE}/${img}`
  }

  const handleMakeOffer = async () => {
    if (!myItemId) {
      Alert.alert('Eksik', 'Teklif etmek istediğiniz ilanın ID\'sini girin.')
      return
    }
    if (!item?.company?.id) return

    setOfferLoading(true)
    try {
      await createOffer({
        toCompanyId: item.company.id,
        offeredItemId: myItemId,
        requestedItemId: item.id,
        offeredQuantity: 1,
        requestedQuantity: 1,
        cashDifference: cashDiff ? Number(cashDiff) : 0,
        message,
      })
      setShowOfferModal(false)
      Alert.alert('Teklif Gönderildi!', 'Karşı firma yanıt verdiğinde bildirim alacaksınız.', [
        { text: 'Tamam', onPress: () => router.push('/(tabs)/takas') },
      ])
    } catch {
      Alert.alert('Hata', 'Teklif gönderilemedi. Firma onaylı mı kontrol edin.')
    } finally {
      setOfferLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#002444" />
      </View>
    )
  }

  if (!item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>İlan bulunamadı</Text>
      </View>
    )
  }

  const isOwn = item.vendorId === user?.id

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Görsel */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: getImage(item) }} style={styles.heroImage} />
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.cityBadge}>
            <Text style={styles.cityBadgeText}>{item.city || 'TÜRKİYE'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Firma */}
          <Text style={styles.companyName}>{item.company?.name || 'Kurumsal Satıcı'}</Text>

          {/* Başlık */}
          <Text style={styles.itemTitle}>{item.title}</Text>

          {/* Fiyat */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>TAKAS DEĞERİ</Text>
            <Text style={styles.price}>
              {new Intl.NumberFormat('tr-TR').format(item.unitPrice)} ₺
            </Text>
          </View>

          {/* Açıklama */}
          {item.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AÇIKLAMA</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}

          {/* Takas Türleri */}
          {item.tradeModes && item.tradeModes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TAKAS TÜRLERİ</Text>
              <View style={styles.chips}>
                {item.tradeModes.map((mode) => (
                  <View key={mode} style={styles.chip}>
                    <Text style={styles.chipText}>{mode.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* İstenen kategoriler */}
          {item.wantedCategories && item.wantedCategories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ARANAN KATEGORİLER</Text>
              <View style={styles.chips}>
                {item.wantedCategories.map((cat) => (
                  <View key={cat} style={[styles.chip, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.chipText, { color: '#3B82F6' }]}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Alt Buton */}
      {!isOwn && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.offerBtn} onPress={() => setShowOfferModal(true)}>
            <Text style={styles.offerBtnText}>TEKLİF VER</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Teklif Modal */}
      <Modal visible={showOfferModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowOfferModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>TEKLİF OLUŞTUR</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalInfo}>
              "{item.title}" ilanına karşılık teklif veriyorsunuz.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Teklif Ettiğiniz İlan ID'si *</Text>
              <TextInput
                style={styles.input}
                placeholder="İlan ID'nizi girin"
                value={myItemId}
                onChangeText={setMyItemId}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nakit Fark (₺)</Text>
              <TextInput
                style={styles.input}
                placeholder="0 (eksi: sizden, artı: karşıdan)"
                keyboardType="numeric"
                value={cashDiff}
                onChangeText={setCashDiff}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mesaj</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Teklifinizi kısaca açıklayın..."
                multiline
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, offerLoading && { opacity: 0.6 }]}
              onPress={handleMakeOffer}
              disabled={offerLoading}
            >
              {offerLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>TEKLİFİ GÖNDER</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#94A3B8', fontSize: 16 },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 320, backgroundColor: '#F1F5F9' },
  back: { position: 'absolute', top: 56, left: 20, backgroundColor: 'rgba(0,0,0,0.4)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#fff', fontSize: 20 },
  cityBadge: { position: 'absolute', bottom: 16, left: 16, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  cityBadgeText: { fontSize: 11, fontWeight: '800', color: '#002444' },
  content: { padding: 24 },
  companyName: { fontSize: 11, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.5, marginBottom: 6 },
  itemTitle: { fontSize: 22, fontWeight: '900', color: '#002444', lineHeight: 28 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  priceLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  price: { fontSize: 22, fontWeight: '900', color: '#002444' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 10 },
  description: { fontSize: 14, color: '#475569', lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#F1F5F9' },
  offerBtn: { backgroundColor: '#002444', borderRadius: 16, padding: 18, alignItems: 'center' },
  offerBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  modal: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 24, backgroundColor: '#002444' },
  modalClose: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  modalContent: { padding: 24, gap: 4 },
  modalInfo: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 20, padding: 16, backgroundColor: '#EFF6FF', borderRadius: 12 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  submitBtn: { backgroundColor: '#002444', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
})
