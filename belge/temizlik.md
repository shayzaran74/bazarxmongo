cd apps/frontend
# Önceki hatalı önbelleği sil
rm -rf node_modules/.vite .nuxt
# Yeniden hazırla ve çalıştır
npx nuxi prepare
pnpm dev



Son Adım: Veritabanını Güncelleyin
Bu değişikliklerin veritabanınıza yansıması için terminalinizde şu komutu çalıştırmanız gerekmektedir (komut bende yetki hatası verebilir, o yüzden sizin çalıştırmanız en sağlıklısı olacaktır):

bash
cd apps/backend
npx prisma db push