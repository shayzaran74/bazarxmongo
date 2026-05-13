Süper! Bağlantı başarıyla kuruldu ve dosyalar çekildi. Şimdi sunucudaki dosyaları bu güncel sürümle eşitleyip sistemi yeniden başlatalım.

Sırasıyla şu komutları çalıştırın:

bash
# Git geçmişini ana daldaki ile eşitle (dosyalara dokunmaz)
git reset --mixed origin/main
# Tüm dosyaları GitHub'daki sürüme güncelle ( .env dosyalarına dokunmaz)
git checkout .
# Ve son olarak sistemi güncelle
./scripts/deploy.sh update
Bu son komuttan sonra hem stok senkronizasyonu hem de admin paneli filtreleri sunucunuzda aktif hale gelecektir. İşlem bittiğinde admin panelini kontrol edebilirsiniz!_


GitHub'a gönderildi. Şimdi sunucuda şu komutu çalıştırın:
git pull origin main 

shayzaran74 
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



./scripts/deploy.sh update

Sürekli şifre girmek gerçekten can sıkıcı. Sunucudaki git yapılandırmasına bu token'ı kalıcı olarak kaydedelim ki bir daha asla sormasın.

Lütfen sunucuda tek seferlik şu iki komutu çalıştırın:

1. Önce şifreyi Git ayarlarınıza kalıcı olarak kaydedin:

bash
git remote set-url origin https://shayzaran74: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@github.com/shayzaran74/bazarx.git
2. Artık şifre sormadan kodları çekip build işlemini başlatabilirsiniz:

bash
git pull origin main && docker compose -f docker-compose.prod.yml build --no-cache
