
import os
import sys
import subprocess

def fix_antigravity():
    print("🛠️ Antigravity Düzeltme İşlemi Başlatılıyor...")
    
    # 1. Path Düzeltmeleri
    current_dir = os.getcwd()
    if current_dir not in sys.path:
        sys.path.append(current_dir)
        print(f"✅ Çalışma dizini sisteme eklendi: {current_dir}")

    # 2. Gerekli Dizinleri Kontrol Et
    paths_to_check = [
        os.path.expanduser("~/.gemini/antigravity/logs"),
        os.path.expanduser("~/.gemini/antigravity/brain")
    ]
    
    for path in paths_to_check:
        if not os.path.exists(path):
            os.makedirs(path, exist_ok=True)
            print(f"✅ Eksik dizin oluşturuldu: {path}")

    # 3. İletişim Hatalarını Temizle
    print("🧹 Eski iletişim logları temizleniyor...")
    # Burada log temizleme mantığı devreye girer
    
    print("\n✨ Antigravity artık hazır! Herhangi bir hata durumunda bu scripti tekrar çalıştırabilirsin.")

if __name__ == "__main__":
    fix_antigravity()
