// apps/mobile/app/takas/surplus/create.tsx
import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import api from '@/services/api'
import type { CreateSurplusDto } from '@/types/surplus'

const TRADE_MODES = ['PRODUCT_FOR_PRODUCT', 'PRODUCT_FOR_SERVICE', 'SERVICE_FOR_SERVICE']
const TRADE_MODE_LABELS: Record<string, string> = {
  PRODUCT_FOR_PRODUCT: 'Ürün ↔ Ürün',
  PRODUCT_FOR_SERVICE: 'Ürün ↔ Hizmet',
  SERVICE_FOR_SERVICE: 'Hizmet ↔ Hizmet',
}

export default function CreateSurplusScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<CreateSurplusDto>>({
    title: '',
    description: '',
    unitPrice: 0,
    quantity: 1,
    images: [],
    city: '',
    tradeModes: [],
  })

  const updateForm = (key: keyof CreateSurplusDto, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleTradeMode = (mode: string) => {
    const current = form.tradeModes || []
    updateForm(
      'tradeModes',
      current.includes(mode) ? current.filter((m) => m !== mode) : [...current, mode]
    )
  }

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    })
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri)
      updateForm('images', [...(form.images || []), ...uris].slice(0, 5))
    }
  }

  const uploadImages = async (uris: string[]): Promise<string[]> => {
    const uploaded: string[] = []
    for (const uri of uris) {
      const formData = new FormData()
      formData.append('file', { uri, name: 'image.jpg', type: 'image/jpeg' } as unknown as Blob)
      const res = await api.post('/api/v1/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res.data.success) uploaded.push(res.data.data.url)
    }
    return uploaded
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.unitPrice) {
      Alert.alert('Eksik Bilgi', 'Lütfen başlık, açıklama ve fiyat giriniz.')
      return
    }
    setLoading(true)
    try {
      const uploadedImages = form.images?.length ? await uploadImages(form.images) : []
      await api.post('/api/v1/surplus', { ...form, images: uploadedImages })
      Alert.alert('Başarılı', 'İlanınız onay için gönderildi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ])
    } catch {
      Alert.alert('Hata', 'İlan oluşturulurken bir sorun oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Başlık */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>YENİ TAKAS İLANI</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.form}>
        {/* Başlık */}
        <View style={styles.field}>
          <Text style={styles.label}>İlan Başlığı *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ürün veya hizmetin adı"
            value={form.title}
            onChangeText={(v) => updateForm('title', v)}
          />
        </View>

        {/* Açıklama */}
        <View style={styles.field}>
          <Text style={styles.label}>Açıklama *</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Detayları yazın..."
            multiline
            value={form.description}
            onChangeText={(v) => updateForm('description', v)}
          />
        </View>

        {/* Fiyat & Adet */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Takas Değeri (₺) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              value={form.unitPrice ? String(form.unitPrice) : ''}
              onChangeText={(v) => updateForm('unitPrice', Number(v) || 0)}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Adet</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="1"
              value={String(form.quantity || 1)}
              onChangeText={(v) => updateForm('quantity', Number(v) || 1)}
            />
          </View>
        </View>

        {/* Şehir */}
        <View style={styles.field}>
          <Text style={styles.label}>Şehir</Text>
          <TextInput
            style={styles.input}
            placeholder="İstanbul"
            value={form.city}
            onChangeText={(v) => updateForm('city', v)}
          />
        </View>

        {/* Takas Türü */}
        <View style={styles.field}>
          <Text style={styles.label}>Takas Türü</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {TRADE_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.chip, (form.tradeModes || []).includes(mode) && styles.chipActive]}
                onPress={() => toggleTradeMode(mode)}
              >
                <Text style={[styles.chipText, (form.tradeModes || []).includes(mode) && styles.chipTextActive]}>
                  {TRADE_MODE_LABELS[mode]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fotoğraflar */}
        <View style={styles.field}>
          <Text style={styles.label}>Fotoğraflar ({form.images?.length || 0}/5)</Text>
          <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImages}>
            <Text style={styles.imagePickerText}>📷 Fotoğraf Ekle</Text>
          </TouchableOpacity>
          {(form.images || []).length > 0 && (
            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 6 }}>
              {form.images?.length} fotoğraf seçildi
            </Text>
          )}
        </View>

        {/* Gönder */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>İLAN VER</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#002444' },
  back: { padding: 4 },
  backText: { color: '#fff', fontSize: 22 },
  title: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  form: { padding: 20, gap: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#0F172A' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#002444', borderColor: '#002444' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#fff' },
  imagePickerBtn: { backgroundColor: '#F1F5F9', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  imagePickerText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  submitBtn: { backgroundColor: '#002444', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
})
