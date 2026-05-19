
import os
import shutil
from pathlib import Path

def clean_antigravity():
    # Antigravity ana dizini
    antigravity_dir = Path.home() / ".gemini" / "antigravity"
    
    # Temizlenecek dizinler
    targets = [
        antigravity_dir / "logs",
        # İhtiyaca göre buraya başka geçici dizinler eklenebilir
    ]
    
    print("🚀 Antigravity Temizlik İşlemi Başlatılıyor...\n")
    
    total_cleaned = 0
    
    for target in targets:
        if target.exists():
            print(f"📁 Klasör kontrol ediliyor: {target}")
            # Klasör içindeki dosyaları sil ama klasörü bırak
            for item in target.iterdir():
                try:
                    if item.is_file():
                        file_size = item.stat().st_size
                        item.unlink()
                        total_cleaned += file_size
                        print(f"  ✅ Silindi: {item.name}")
                    elif item.is_dir():
                        shutil.rmtree(item)
                        print(f"  ✅ Silindi (Klasör): {item.name}")
                except Exception as e:
                    print(f"  ❌ Hata ( {item.name} ): {e}")
        else:
            print(f"❓ Klasör bulunamadı: {target}")

    # Ekstra: Eski brain logları (opsiyonel temizlik)
    # brain_dir = antigravity_dir / "brain"
    # Burası çok hassas olduğu için şimdilik sadece logs klasörüne odaklandık.

    print(f"\n✨ Temizlik Tamamlandı! Toplam {total_cleaned / (1024*1024):.2f} MB yer açıldı.")

if __name__ == "__main__":
    clean_antigravity()
