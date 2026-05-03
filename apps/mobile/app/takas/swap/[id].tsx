// apps/mobile/app/takas/swap/[id].tsx
import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSwapSession } from '@/hooks/useSwapSession'

const STATUS_STEPS = [
  { key: 'PENDING_COLLATERAL', label: 'Teminat Bekleniyor' },
  { key: 'ACTIVE', label: 'Kargo Aşaması' },
  { key: 'SHIPPING', label: 'Kargoda' },
  { key: 'PARTIALLY_COMPLETED', label: 'Teslim Onayı' },
  { key: 'COMPLETED', label: 'Tamamlandı' },
]

const STATUS_LABELS: Record<string, string> = {
  PENDING_COLLATERAL: 'Teminat Bekleniyor',
  ACTIVE: 'Aktif — Kargo Gönderin',
  SHIPPING: 'Kargolar Yolda',
  PARTIALLY_COMPLETED: 'Teslimat Onayı Bekleniyor',
  COMPLETED: 'Takas Tamamlandı',
  DISPUTED: 'Anlaşmazlık Açıldı',
  CANCELLED: 'İptal Edildi',
  TIMEOUT: 'Süre Doldu',
}

export default function SwapSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session, loading, actionLoading, fetchSession, submitShipping, confirmReceipt, finalizeSwap, sendDispute } = useSwapSession(id)

  const [showShippingModal, setShowShippingModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [carrier, setCarrier] = useState('')
  const [disputeReason, setDisputeReason] = useState('')

  useEffect(() => { fetchSession() }, [])

  const handleShip = async () => {
    if (!trackingCode || !carrier) {
      Alert.alert('Eksik', 'Lütfen kargo kodu ve firma adını girin.')
      return
    }
    await submitShipping(trackingCode, carrier)
    setShowShippingModal(false)
    Alert.alert('Başarılı', 'Kargo bilgileri iletildi.')
  }

  const handleConfirm = () => {
    Alert.alert('Teslim Onayı', 'Ürünü teslim aldığınızı onaylıyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Onayla', onPress: confirmReceipt },
    ])
  }

  const handleFinalize = () => {
    Alert.alert('Takası Sonlandır', 'Teminatlar serbest bırakılacak. Emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sonlandır', onPress: finalizeSwap },
    ])
  }

  const handleDispute = async () => {
    if (disputeReason.length < 10) {
      Alert.alert('Eksik', 'Lütfen en az 10 karakter açıklama girin.')
      return
    }
    await sendDispute(disputeReason)
    setShowDisputeModal(false)
    Alert.alert('Anlaşmazlık Açıldı', 'Destek ekibimiz en kısa sürede ilgilenecek.')
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === session?.status)

  if (loading && !session) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#002444" /></View>
  }
  if (!session) {
    return <View style={styles.centered}><Text style={styles.errorText}>Takas seansı bulunamadı</Text></View>
  }

  const isActive = session.status === 'ACTIVE'
  const isShipping = session.status === 'SHIPPING'
  const isPartially = session.status === 'PARTIALLY_COMPLETED'
  const isCompleted = session.status === 'COMPLETED'
  const isDisputed = session.status === 'DISPUTED'
  const canDispute = ['ACTIVE', 'SHIPPING', 'PARTIALLY_COMPLETED'].includes(session.status)

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Başlık */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>TAKAS SEANSİ</Text>
          <Text style={styles.sessionId}>#{session.id.substring(0, 6).toUpperCase()}</Text>
        </View>

        <View style={styles.content}>
          {/* Durum Başlığı */}
          <View style={[styles.statusCard, isCompleted && styles.statusCardGreen, isDisputed && styles.statusCardRed]}>
            <Text style={styles.statusMain}>{STATUS_LABELS[session.status] || session.status}</Text>
          </View>

          {/* Adım Göstergesi */}
          {!isDisputed && !isCompleted && (
            <View style={styles.stepper}>
              {STATUS_STEPS.map((step, idx) => (
                <View key={step.key} style={styles.stepRow}>
                  <View style={[styles.stepDot,
                    idx < currentStepIndex && styles.stepDotDone,
                    idx === currentStepIndex && styles.stepDotActive,
                  ]}>
                    <Text style={styles.stepDotText}>{idx < currentStepIndex ? '✓' : idx + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, idx === currentStepIndex && styles.stepLabelActive]}>
                    {step.label}
                  </Text>
                  {idx < STATUS_STEPS.length - 1 && (
                    <View style={[styles.stepLine, idx < currentStepIndex && styles.stepLineDone]} />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Taraf Bilgileri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TARAFLAR</Text>
            <View style={styles.partiesRow}>
              <View style={styles.partyCard}>
                <Text style={styles.partyRole}>GÖNDEREN</Text>
                <Text style={styles.partyName}>{session.fromCompany?.name || '—'}</Text>
              </View>
              <Text style={styles.partiesArrow}>⇄</Text>
              <View style={styles.partyCard}>
                <Text style={styles.partyRole}>ALICI</Text>
                <Text style={styles.partyName}>{session.toCompany?.name || '—'}</Text>
              </View>
            </View>
          </View>

          {/* Kargo Bilgileri */}
          {session.parts && session.parts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KARGO DURUMU</Text>
              {session.parts.map((part) => (
                <View key={part.id} style={styles.partCard}>
                  <View style={styles.partStatus}>
                    <View style={[styles.partDot, {
                      backgroundColor: part.status === 'CONFIRMED' ? '#10B981'
                        : part.status === 'SHIPPED' ? '#3B82F6'
                        : '#F59E0B'
                    }]} />
                    <Text style={styles.partStatusText}>{part.status}</Text>
                  </View>
                  {part.trackingCode && (
                    <Text style={styles.trackingCode}>Takip: {part.trackingCode} — {part.carrier}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Anlaşmazlık uyarısı */}
          {isDisputed && (
            <View style={styles.disputeCard}>
              <Text style={styles.disputeTitle}>⚠️ Anlaşmazlık Açıldı</Text>
              <Text style={styles.disputeDesc}>Destek ekibimiz incelemeye aldı. En kısa sürede geri dönülecek.</Text>
            </View>
          )}

          {/* Aksiyon Butonları */}
          <View style={styles.actions}>
            {isActive && (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowShippingModal(true)} disabled={actionLoading}>
                <Text style={styles.primaryBtnText}>📦 KARGO BİLGİSİ GİR</Text>
              </TouchableOpacity>
            )}

            {(isShipping || isPartially) && (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm} disabled={actionLoading}>
                {actionLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>✅ TESLİMATI ONAYLA</Text>}
              </TouchableOpacity>
            )}

            {isPartially && (
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleFinalize} disabled={actionLoading}>
                <Text style={styles.secondaryBtnText}>🔓 TAKASI SONLANDИР</Text>
              </TouchableOpacity>
            )}

            {canDispute && (
              <TouchableOpacity style={styles.dangerBtn} onPress={() => setShowDisputeModal(true)}>
                <Text style={styles.dangerBtnText}>⚠️ ANLAŞMAZLİK AÇ</Text>
              </TouchableOpacity>
            )}

            {isCompleted && (
              <View style={styles.completedCard}>
                <Text style={styles.completedText}>🎉 Takas başarıyla tamamlandı!</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Kargo Modal */}
      <Modal visible={showShippingModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowShippingModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>KARGO BİLGİSİ</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Kargo Takip Numarası *</Text>
              <TextInput style={styles.input} placeholder="Örn: 1Z999AA10123456784" value={trackingCode} onChangeText={setTrackingCode} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Kargo Firması *</Text>
              <TextInput style={styles.input} placeholder="Örn: MNG, Yurtiçi, Aras" value={carrier} onChangeText={setCarrier} />
            </View>
            <TouchableOpacity style={[styles.submitBtn, actionLoading && { opacity: 0.6 }]} onPress={handleShip} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>KAYDET</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Anlaşmazlık Modal */}
      <Modal visible={showDisputeModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ANLAŞMAZLİK AÇ</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.modalContent}>
            <View style={styles.field}>
              <Text style={styles.label}>Sorunuzu Açıklayın *</Text>
              <TextInput
                style={[styles.input, { height: 120 }]}
                multiline
                placeholder="Minimum 10 karakter. Yaşadığınız sorunu detaylıca açıklayın..."
                value={disputeReason}
                onChangeText={setDisputeReason}
              />
            </View>
            <TouchableOpacity style={[styles.dangerSubmitBtn, actionLoading && { opacity: 0.6 }]} onPress={handleDispute} disabled={actionLoading}>
              {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>ANLAŞMAZLİK BAŞLAT</Text>}
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
  sessionId: { color: '#60A5FA', fontSize: 12, fontWeight: '800' },
  content: { padding: 20 },
  statusCard: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  statusCardGreen: { backgroundColor: '#ECFDF5' },
  statusCardRed: { backgroundColor: '#FEF2F2' },
  statusMain: { fontSize: 16, fontWeight: '900', color: '#002444' },
  stepper: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, position: 'relative' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  stepDotDone: { backgroundColor: '#10B981' },
  stepDotActive: { backgroundColor: '#002444' },
  stepDotText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  stepLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  stepLabelActive: { color: '#002444', fontWeight: '800' },
  stepLine: { position: 'absolute', left: 14, top: 28, width: 1, height: 12, backgroundColor: '#E2E8F0' },
  stepLineDone: { backgroundColor: '#10B981' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 10 },
  partiesRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partyCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  partyRole: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  partyName: { fontSize: 13, fontWeight: '800', color: '#002444', marginTop: 4, textAlign: 'center' },
  partiesArrow: { fontSize: 22, color: '#3B82F6' },
  partCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  partStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partDot: { width: 10, height: 10, borderRadius: 5 },
  partStatusText: { fontSize: 13, fontWeight: '700', color: '#002444' },
  trackingCode: { fontSize: 12, color: '#64748B', marginTop: 4 },
  disputeCard: { backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, marginBottom: 20 },
  disputeTitle: { fontSize: 14, fontWeight: '800', color: '#DC2626', marginBottom: 6 },
  disputeDesc: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  actions: { gap: 12, marginTop: 8 },
  primaryBtn: { backgroundColor: '#002444', borderRadius: 16, padding: 18, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  secondaryBtn: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 18, alignItems: 'center' },
  secondaryBtnText: { color: '#002444', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  dangerBtn: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, alignItems: 'center' },
  dangerBtnText: { color: '#DC2626', fontSize: 13, fontWeight: '800' },
  completedCard: { backgroundColor: '#ECFDF5', borderRadius: 16, padding: 20, alignItems: 'center' },
  completedText: { fontSize: 15, fontWeight: '800', color: '#059669' },
  modal: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 24, backgroundColor: '#002444' },
  modalClose: { color: '#fff', fontSize: 18, fontWeight: '700' },
  modalTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  modalContent: { padding: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  submitBtn: { backgroundColor: '#002444', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  dangerSubmitBtn: { backgroundColor: '#DC2626', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
})
