📦 FAZ 10 — Gemini Prompt
markdown# GÖREV: Barter + Auction + Chat + Bildirim Sistemi

## Backend Endpoint'leri
Barter
GET  /api/v1/listings (surplus ile aynı)
POST /api/v1/listings (surplus create)
POST /api/v1/barter/accept-trade (handler var)
GET  /api/v1/barter/my-offers → stub gerekiyor
Auction
GET  /api/v1/auction/active → (auction module var, controller eksik) → stub
POST /api/v1/auction/bid → place-bid.handler.ts var
POST /api/v1/auction/draw → draw-lottery.handler.ts var
Chat (CommunicationModule disabled in AppModule!)
Not: app.module.ts'de // CommunicationModule, yorumlu!
Socket.io gateway var ama module disabled
→ Stub server routes + mock socket
Bildirim
CommunicationModule disabled → stub

## YAPILACAKLAR

### 1. ÖNEMLİ: CommunicationModule Backend'de Disabled
`app.module.ts` içinde `CommunicationModule` yorumlanmış durumda.
Bu nedenle chat ve bildirim endpoint'leri **çalışmıyor**.

Çözüm — Frontend'e özel stub server routes oluştur: