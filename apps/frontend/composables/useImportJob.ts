// apps/frontend/composables/useImportJob.ts
// Kullanım:
//   const { start, status, progress, isDone, errors } = useImportJob()
//   await start(rows)  // Excel parse edilmiş rows dizisi

import { ref, computed } from 'vue'

interface ImportProgress {
  percent: number
  processed: number
  total: number
  created: number
  failed: number
}

interface ImportJobState {
  jobId: string | null
  status: 'idle' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: ImportProgress
  errors: string[]
  elapsedSeconds: number | null
}

const POLL_INTERVAL_MS = 2_000  // 2 saniyede bir polling
const MAX_ROWS = 50_000

export function useImportJob() {
  const state = ref<ImportJobState>({
    jobId: null,
    status: 'idle',
    progress: { percent: 0, processed: 0, total: 0, created: 0, failed: 0 },
    errors: [],
    elapsedSeconds: null,
  })

  let pollTimer: any = null

  // ─── Computed ──────────────────────────────────────────────────────────────

  const isDone = computed(() =>
    state.value.status === 'COMPLETED' || state.value.status === 'FAILED',
  )

  const statusLabel = computed(() => {
    const map: Record<string, string> = {
      idle:       'Bekleniyor',
      PENDING:    'Kuyruğa alındı...',
      PROCESSING: `İşleniyor... %${state.value.progress.percent}`,
      COMPLETED:  'Tamamlandı ✓',
      FAILED:     'Başarısız ✗',
    }
    return map[state.value.status] ?? state.value.status
  })

  // ─── Metotlar ─────────────────────────────────────────────────────────────

  /** Excel'den parse edilmiş rows dizisini gönderir, polling başlatır */
  async function start(rows: any[]) {
    if (rows.length === 0) throw new Error('En az 1 satır gereklidir')
    if (rows.length > MAX_ROWS) {
      throw new Error(`Maksimum ${MAX_ROWS.toLocaleString('tr-TR')} satır yüklenebilir`)
    }

    reset()

    const { $api } = useApi()
    const response = await $api<{ jobId: string }>('/admin/products/bulk-import', {
      method: 'POST',
      body: { rows },
    })

    if (response.data) {
      state.value.jobId = response.data.jobId
      state.value.status = 'PENDING'
      state.value.progress.total = rows.length
    }

    schedulePoll()
    return state.value.jobId
  }

  /** Polling: 2sn'de bir job durumunu sorgular */
  async function poll() {
    if (!state.value.jobId || isDone.value) return

    try {
      const { $api } = useApi()
      const response = await $api<{
        status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
        progress: ImportProgress
        errors: string[]
        timing: { elapsedSeconds: number | null }
      }>(`/admin/products/import-jobs/${state.value.jobId}`)

      if (response.data) {
        const { status, progress, errors, timing } = response.data

        state.value.status = status
        state.value.progress = progress
        state.value.errors = (errors as string[]) ?? []
        state.value.elapsedSeconds = timing.elapsedSeconds
      }

      if (!isDone.value) {
        schedulePoll()
      }
    } catch {
      // Ağ hatası geçici olabilir, polling'e devam et
      schedulePoll()
    }
  }

  function schedulePoll() {
    pollTimer = setTimeout(poll, POLL_INTERVAL_MS)
  }

  function reset() {
    if (pollTimer) clearTimeout(pollTimer)
    state.value = {
      jobId: null,
      status: 'idle',
      progress: { percent: 0, processed: 0, total: 0, created: 0, failed: 0 },
      errors: [],
      elapsedSeconds: null,
    }
  }

  return {
    // State
    jobId:   computed(() => state.value.jobId),
    status:  computed(() => state.value.status),
    progress: computed(() => state.value.progress),
    errors:  computed(() => state.value.errors),
    elapsedSeconds: computed(() => state.value.elapsedSeconds),
    // Computed
    isDone,
    statusLabel,
    // Metotlar
    start,
    reset,
  }
}
