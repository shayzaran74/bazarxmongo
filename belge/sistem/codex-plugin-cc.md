# Codex Plugin for Claude Code — İnceleme ve Kurulum Rehberi

> Kaynak: <https://github.com/openai/codex-plugin-cc.git>
> Sürüm: `1.0.4` · Lisans: Apache-2.0 · Üretici: OpenAI

Bu doküman, OpenAI'nin **Codex** aracını **Claude Code** içinden kullanmayı sağlayan resmi eklentiyi (`@openai/codex-plugin-cc`) inceler ve kurulumunu adım adım açıklar.

---

## 1. Eklenti Ne İşe Yarar?

Claude Code kullanırken, kod incelemesi (code review) yaptırmak veya bir görevi arka planda **Codex**'e devretmek için kullanılır. Claude Code'dan çıkmadan, zaten alışık olduğun iş akışının içinden Codex'i çağırırsın.

Sağladığı slash komutları:

| Komut | Amaç |
|-------|------|
| `/codex:review` | Normal, salt-okunur Codex kod incelemesi |
| `/codex:adversarial-review` | Tasarımı/kararları sorgulayan, yönlendirilebilir (steerable) inceleme |
| `/codex:rescue` | Bir görevi Codex'e devret (hata araştır, fix dene, sürdür) |
| `/codex:status` | Çalışan/yakın zamanda biten Codex işlerini göster |
| `/codex:result` | Biten bir işin nihai çıktısını göster (Codex session ID dahil) |
| `/codex:cancel` | Aktif arka plan işini iptal et |
| `/codex:setup` | Codex CLI hazır mı kontrol et + review-gate aç/kapat |

Ayrıca `/agents` içinde `codex:codex-rescue` adlı bir subagent görünür.

---

## 2. Gereksinimler

- **ChatGPT aboneliği (Free dahil) veya OpenAI API anahtarı.**
  - Kullanım, Codex kullanım limitlerine sayılır.
- **Node.js 18.18 veya üzeri.**
- Yerelde kurulu **Codex CLI** (`@openai/codex`). Eklenti ayrı bir runtime kurmaz; makinedeki mevcut `codex` binary'sini ve mevcut oturum/authentication durumunu kullanır.

> Not: Bu makinede Codex'e zaten giriş yaptıysan, aynı hesap eklentide de doğrudan çalışır.

---

## 3. Kurulum

### Adım 1 — Marketplace'i ekle

Claude Code içinde:

```bash
/plugin marketplace add openai/codex-plugin-cc
```

### Adım 2 — Eklentiyi kur

```bash
/plugin install codex@openai-codex
```

> `codex` = eklenti adı, `openai-codex` = marketplace adı (`.claude-plugin/marketplace.json` içindeki `name`).

### Adım 3 — Eklentileri yeniden yükle

```bash
/reload-plugins
```

### Adım 4 — Kurulumu doğrula

```bash
/codex:setup
```

`/codex:setup` Codex'in hazır olup olmadığını söyler. Codex eksikse ve `npm` mevcutsa, senin için kurmayı teklif edebilir.

Codex'i kendin kurmak istersen:

```bash
npm install -g @openai/codex
```

Codex kurulu ama henüz giriş yapılmamışsa:

```bash
!codex login
```

> `!` öneki, komutu bu Claude Code oturumunda çalıştırır ve çıktısını sohbete getirir. `codex login` hem ChatGPT hesabı hem de API anahtarı ile girişi destekler.

### Adım 5 — İlk çalıştırma (öneri)

```bash
/codex:review --background
/codex:status
/codex:result
```

Kurulum sonrası görmen gerekenler:
- Aşağıdaki slash komutları listede
- `/agents` içinde `codex:codex-rescue` subagent'ı

---

## 4. Komut Kullanımı (Özet)

### `/codex:review`
Mevcut çalışmana normal Codex incelemesi yapar. Salt-okunur — değişiklik yapmaz.
- `--base <ref>` → branch incelemesi (ör. `main`'e göre)
- `--wait` → ön planda bekle · `--background` → arka planda çalıştır
- Yönlendirilemez, özel odak metni almaz.

```bash
/codex:review
/codex:review --base main
/codex:review --background
```

### `/codex:adversarial-review`
**Yönlendirilebilir** inceleme: seçilen yaklaşımı, tradeoff'ları, hata modlarını sorgular. `--base`, `--wait`, `--background` destekler; ek olarak flag'lerden sonra **odak metni** alabilir.

```bash
/codex:adversarial-review --base main caching ve retry tasarımı doğru muydu sorgula
/codex:adversarial-review --background race condition ara ve yaklaşımı sorgula
```

### `/codex:rescue`
Bir görevi `codex:codex-rescue` subagent'ı üzerinden Codex'e devreder. `--background`, `--wait`, `--resume`, `--fresh` destekler.
- `--model` / `--effort` vermezsen Codex kendi varsayılanını seçer.
- `spark` dersen `gpt-5.3-codex-spark`'a eşlenir.

```bash
/codex:rescue testlerin neden patladığını araştır
/codex:rescue --resume son çalışmadaki ilk fix'i uygula
/codex:rescue --model gpt-5.4-mini --effort medium flaky entegrasyon testini araştır
```

### `/codex:status` · `/codex:result` · `/codex:cancel`

```bash
/codex:status            # çalışan/son işler
/codex:result            # son biten işin çıktısı (+ session ID)
/codex:cancel task-abc123 # belirli işi iptal et
```

---

## 5. Mimari (Eklenti İçi Yapı)

```
plugins/codex/
├── .claude-plugin/plugin.json   # Eklenti manifesti (name, version)
├── commands/                    # 7 slash komut tanımı (.md)
├── agents/codex-rescue.md       # codex-rescue subagent tanımı
├── hooks/hooks.json             # SessionStart/SessionEnd/Stop hook'ları
├── prompts/                     # adversarial-review + stop-review-gate prompt şablonları
├── schemas/review-output.schema.json
├── skills/                      # codex-cli-runtime, codex-result-handling, gpt-5-4-prompting
└── scripts/
    ├── codex-companion.mjs       # Ana giriş noktası (review/rescue/status/result/...)
    ├── app-server-broker.mjs     # Codex app server köprüsü
    ├── session-lifecycle-hook.mjs
    ├── stop-review-gate-hook.mjs
    └── lib/                       # codex.mjs, git.mjs, state.mjs, job-control.mjs, ...
```

- Komutlar (`commands/*.md`), `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" <alt-komut> "$ARGUMENTS"` çağırır.
- `codex-companion.mjs`, **Codex app server**'ı sarmalar ve yereldeki global `codex` binary'sini kullanır.
- Arka plan işleri Claude Code'un `Bash(run_in_background: true)` mekanizmasıyla detach edilir; işler `state`/`job-control` katmanında izlenir.

---

## 6. Yapılandırma (Codex Config)

Eklenti, senin mevcut Codex yapılandırmanı aynen kullanır. Varsayılan model/effort değiştirmek için `config.toml` kullan:

```toml
# .codex/config.toml (proje kökü) veya ~/.codex/config.toml (kullanıcı)
model = "gpt-5.4-mini"
model_reasoning_effort = "high"
```

Yükleme önceliği:
- Kullanıcı seviyesi: `~/.codex/config.toml`
- Proje seviyesi: `.codex/config.toml` (yalnızca **proje "trusted" ise** yüklenir)

Farklı bir endpoint için Codex config'inde `openai_base_url` ayarlanabilir.

---

## 7. Review Gate (Opsiyonel Durdurma Kapısı)

`/codex:setup` ile yönetilen opsiyonel bir özellik:

```bash
/codex:setup --enable-review-gate
/codex:setup --disable-review-gate
```

Aktifken eklenti bir **`Stop` hook'u** kullanır: Claude'un yanıtına dayalı hedefli bir Codex incelemesi çalıştırır. İnceleme sorun bulursa, "stop" engellenir ve Claude önce sorunları ele alır.

> ⚠️ **Uyarı:** Review gate uzun bir Claude/Codex döngüsü yaratabilir ve kullanım limitlerini hızla tüketebilir. Yalnızca oturumu aktif izleyeceğin zaman aç.

---

## 8. Tipik Akışlar

```bash
# Göndermeden önce inceleme
/codex:review

# Bir problemi Codex'e devret
/codex:rescue CI'da build neden patlıyor araştır

# Uzun süren işi başlat, sonra kontrol et
/codex:adversarial-review --background
/codex:status
/codex:result
```

İşi tamamen Codex'e taşımak istersen: `/codex:result` veya `/codex:status`'tan aldığın session ID ile `codex resume <session-id>` çalıştırarak aynı oturumu Codex içinde sürdürebilirsin.

---

## 9. SSS Özeti

- **Ayrı Codex hesabı gerekir mi?** Hayır; makinedeki mevcut Codex CLI authentication'ı kullanılır.
- **Ayrı runtime mı?** Hayır; aynı yerel Codex CLI + app server, aynı repo checkout'u, aynı ortam.
- **Mevcut config'im geçerli mi?** Evet; aynı config.toml ve giriş yöntemi aynen geçerli.

---

*Bu doküman incelenen repo'nun `README.md`, `plugin.json`, `marketplace.json`, `hooks.json` ve `commands/` içeriklerine dayanır.*


kullanma   1. Doğal dille devretme (en pratik) — /codex:rescue yazmana gerek yok. Bana normal cümleyle
  söyle, ben Codex'e yönlendiririm:
  Codex'e şunu yaptır: veritabanı bağlantısını daha dayanıklı olacak şekilde yeniden tasarla
  Bunu Codex'le araştır: testler neden patlıyor
  Burada "Codex" demen yeterli — slash komutu şart değil.

  2. Otomatik mod — Review Gate (tamamen elsiz) — /codex:setup --enable-review-gate ile açarsan,
  her yanıtımın sonunda Codex otomatik bir inceleme çalıştırır; hiç komut yazmazsın.
  /codex:setup --enable-review-gate     # aç
  /codex:setup --disable-review-gate    # kapat

  ▎ ⚠️  Uyarı: Bu, uzun bir Claude↔Codex döngüsü yaratıp kullanım limitlerini hızla tüketebilir.
  ▎ Sadece oturumu aktif izleyeceğin zaman aç.

  Özet


  1. Doğal dille devretme (en pratik) — /codex:rescue yazmana gerek yok. Bana normal
  cümleyle söyle, ben Codex'e yönlendiririm:
  Codex'e şunu yaptır: veritabanı bağlantısını daha dayanıklı olacak şekilde yeniden
  tasarla
  Bunu Codex'le araştır: testler neden patlıyor
  Burada "Codex" demen yeterli — slash komutu şart değil.

  2. Otomatik mod — Review Gate (tamamen elsiz) — /codex:setup --enable-review-gate ile
  açarsan, her yanıtımın sonunda Codex otomatik bir inceleme çalıştırır; hiç komut
  yazmazsın.
  /codex:setup --enable-review-gate     # aç
  /codex:setup --disable-review-gate    # kapat

  ▎ ⚠️  Uyarı: Bu, uzun bir Claude↔Codex döngüsü yaratıp kullanım limitlerini hızla
  ▎ tüketebilir. Sadece oturumu aktif izleyeceğin zaman aç.

  Özet

  açarsan, her yanıtımın sonunda Codex otomatik bir inceleme çalıştırır; hiç komut
  yazmazsın.
  /codex:setup --enable-review-gate     # aç
  /codex:setup --disable-review-gate    # kapat

  ▎ ⚠️  Uyarı: Bu, uzun bir Claude↔Codex döngüsü yaratıp kullanım limitlerini hızla
  ▎ tüketebilir. Sadece oturumu aktif izleyeceğin zaman aç.

  Özet

  Özet

  ┌─────────────────────────────────────────┬────────────────────────────────────────┐
  │                İstediğin                │                 Yöntem                 │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ Claude'un modelini değiştir             │ /model                                 │
  │ (Opus/Sonnet)                           │                                        │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ Codex'e tek iş ver, komut yazmadan      │ "Codex'e şunu yaptır…" diye yaz        │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ Codex'e açık komutla iş ver             │ /codex:rescue …, /codex:review         │
  ├─────────────────────────────────────────┼────────────────────────────────────────┤
  │ Codex'i otomatik çalıştır               │ Review gate'i aç                       │
  │                                         │ (--enable-review-gate)                 │
  └─────────────────────────────────────────┴────────────────────────────────────────┘

  Yani: kod yazma/iş senin ana akışında bende (Claude) kalır; Codex'i sadece incelemek
  veya bir görevi ona devretmek istediğinde — ister /codex:* ile ister "Codex'e yaptır"
  diyerek — çağırırsın. Kalıcı "hep Codex" modu yok; en yakını review gate.