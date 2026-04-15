#!/usr/bin/env python3
"""
Monorepo kalıcı mimari düzeltme scripti
----------------------------------------
1. tsconfig.base.json'dan baseUrl ve paths kaldırır
2. Her paketin src/ dosyalarını tarar → hangi @barterborsa/* import ettiğini bulur
3. Her paketin tsconfig.json'ına sadece kendi bağımlılıklarını dist/'e işaret eden paths yazar
4. Root'a IDE için tsconfig.dev.json oluşturur (src/'e işaret eder)
5. Paketleri sırayla derler
6. .vscode/settings.json'a tsconfig.dev.json'ı ekler
"""

import json
import re
import subprocess
import sys
import os
import copy
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PACKAGES = [
    ("shared-types",         "packages/shared/shared-types"),
    ("shared-core",          "packages/shared/shared-core"),
    ("shared-nest",          "packages/shared/shared-nest"),
    ("shared-security",      "packages/shared/shared-security"),
    ("shared-messaging",     "packages/shared/shared-messaging"),
    ("shared-observability", "packages/shared/shared-observability"),
    ("shared-persistence",   "packages/shared/shared-persistence"),
]

# Tüm bilinen paket adı → dist yolu eşleşmesi
ALL_PACKAGES_DIST = {
    "@barterborsa/shared-types":         "packages/shared/shared-types/dist/index.d.ts",
    "@barterborsa/shared-core":          "packages/shared/shared-core/dist/index.d.ts",
    "@barterborsa/shared-nest":          "packages/shared/shared-nest/dist/index.d.ts",
    "@barterborsa/shared-security":      "packages/shared/shared-security/dist/index.d.ts",
    "@barterborsa/shared-messaging":     "packages/shared/shared-messaging/dist/index.d.ts",
    "@barterborsa/shared-observability": "packages/shared/shared-observability/dist/index.d.ts",
    "@barterborsa/shared-persistence":   "packages/shared/shared-persistence/dist/index.d.ts",
    "@barterborsa/domain-identity":      "packages/domain-identity/dist/index.d.ts",
}

# IDE için src yolları
ALL_PACKAGES_SRC = {
    "@barterborsa/shared-types":         "packages/shared/shared-types/src/index.ts",
    "@barterborsa/shared-core":          "packages/shared/shared-core/src/index.ts",
    "@barterborsa/shared-nest":          "packages/shared/shared-nest/src/index.ts",
    "@barterborsa/shared-security":      "packages/shared/shared-security/src/index.ts",
    "@barterborsa/shared-messaging":     "packages/shared/shared-messaging/src/index.ts",
    "@barterborsa/shared-observability": "packages/shared/shared-observability/src/index.ts",
    "@barterborsa/shared-persistence":   "packages/shared/shared-persistence/src/index.ts",
    "@barterborsa/domain-identity":      "packages/domain-identity/src/index.ts",
}

# ── Yardımcılar ────────────────────────────────────────────────────────────────

def sep(char="=", w=60): print(char * w)

def read_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

def backup(path):
    backup_path = path + ".bak"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    with open(backup_path, "w", encoding="utf-8") as f:
        f.write(content)
    return backup_path

# ── Adım 1: tsconfig.base.json düzelt ─────────────────────────────────────────

def fix_tsconfig_base():
    path = os.path.join(BASE_DIR, "tsconfig.base.json")
    if not os.path.exists(path):
        print("  ⚠️  tsconfig.base.json bulunamadı, atlanıyor.")
        return

    bak = backup(path)
    print(f"  📋 Yedek: tsconfig.base.json.bak")

    data = read_json(path)
    opts = data.get("compilerOptions", {})

    # baseUrl ve paths kaldır
    removed = []
    for key in ["baseUrl", "paths"]:
        if key in opts:
            del opts[key]
            removed.append(key)

    data["compilerOptions"] = opts
    write_json(path, data)

    if removed:
        print(f"  ✅ Kaldırıldı: {', '.join(removed)}")
    else:
        print(f"  ℹ️  Zaten temiz, değişiklik yok.")

# ── Adım 2: Paketin import ettiği @barterborsa/* paketlerini bul ───────────────

def find_barterborsa_imports(pkg_dir):
    """src/ altındaki tüm .ts dosyalarını tara, @barterborsa/* importlarını bul."""
    src_dir = os.path.join(pkg_dir, "src")
    if not os.path.exists(src_dir):
        return set()

    imports = set()
    pattern = re.compile(r"""from\s+['"](@barterborsa/[^'"]+)['"]""")

    for ts_file in glob.glob(os.path.join(src_dir, "**", "*.ts"), recursive=True):
        with open(ts_file, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        for match in pattern.finditer(content):
            pkg_name = match.group(1)
            # Alt path varsa sadece paket adını al: @barterborsa/shared-core/something → @barterborsa/shared-core
            parts = pkg_name.split("/")
            pkg_name = "/".join(parts[:2])
            if pkg_name in ALL_PACKAGES_DIST:
                imports.add(pkg_name)

    return imports

# ── Adım 3: Her paketin tsconfig.json'ını güncelle ────────────────────────────

def fix_package_tsconfig(name, pkg_dir):
    tsconfig_path = os.path.join(pkg_dir, "tsconfig.json")
    if not os.path.exists(tsconfig_path):
        print(f"  ⚠️  tsconfig.json bulunamadı, atlanıyor.")
        return

    # Import analizi
    imports = find_barterborsa_imports(pkg_dir)
    print(f"  📦 Bulunan bağımlılıklar: {', '.join(sorted(imports)) if imports else '(yok)'}")

    bak = backup(tsconfig_path)

    data = read_json(tsconfig_path)
    opts = data.setdefault("compilerOptions", {})

    # baseUrl = monorepo kökünden çözümleme için "../../.." (pakete göre değişir)
    # Göreceli yol hesapla
    rel_to_root = os.path.relpath(BASE_DIR, pkg_dir)
    opts["baseUrl"] = rel_to_root if rel_to_root != "." else "."

    # Sadece bu paketin import ettiği paketleri ekle
    if imports:
        paths = {}
        for imp in sorted(imports):
            dist_path = ALL_PACKAGES_DIST[imp]
            # dist_path monorepo kökünden göreceli → paketten göreceli yap
            abs_dist = os.path.join(BASE_DIR, dist_path)
            rel_dist = os.path.relpath(abs_dist, pkg_dir)
            paths[imp] = [rel_dist]
        opts["paths"] = paths
    else:
        # paths varsa kaldır
        opts.pop("paths", None)

    write_json(tsconfig_path, data)
    print(f"  ✅ tsconfig.json güncellendi")

# ── Adım 4: tsconfig.dev.json oluştur (IDE için) ──────────────────────────────

def create_dev_tsconfig():
    path = os.path.join(BASE_DIR, "tsconfig.dev.json")

    data = {
        "_comment": "IDE (VSCode) için — derleme için kullanma. src/ yollarına işaret eder.",
        "extends": "./tsconfig.base.json",
        "compilerOptions": {
            "baseUrl": ".",
            "paths": {k: [v] for k, v in ALL_PACKAGES_SRC.items()}
        },
        "include": ["packages/**/*"],
        "exclude": ["node_modules", "dist", "**/dist/**"]
    }

    write_json(path, data)
    print(f"  ✅ tsconfig.dev.json oluşturuldu")

# ── Adım 5: .vscode/settings.json güncelle ────────────────────────────────────

def update_vscode_settings():
    vscode_dir = os.path.join(BASE_DIR, ".vscode")
    os.makedirs(vscode_dir, exist_ok=True)
    settings_path = os.path.join(vscode_dir, "settings.json")

    if os.path.exists(settings_path):
        settings = read_json(settings_path)
    else:
        settings = {}

    settings["typescript.tsdk"] = "node_modules/typescript/lib"
    settings["typescript.preferences.importModuleSpecifier"] = "non-relative"

    write_json(settings_path, settings)
    print(f"  ✅ .vscode/settings.json güncellendi")
    print(f"  ℹ️  VSCode'da Cmd+Shift+P → 'TypeScript: Select TypeScript Version'")
    print(f"     → 'Use Workspace Version' seç")

# ── Adım 6: Dist temizle ───────────────────────────────────────────────────────

def clean_dist(pkg_dir):
    dist = os.path.join(pkg_dir, "dist")
    if os.path.exists(dist):
        subprocess.run(f"rm -rf {dist}", shell=True, check=True)
        print(f"  🗑️  dist/ temizlendi")

# ── Adım 7: Derle ─────────────────────────────────────────────────────────────

def build_package(name, pkg_dir):
    tsconfig_path = os.path.join(pkg_dir, "tsconfig.json")
    cmd = f"npx tsc --build --force {tsconfig_path}"
    result = subprocess.run(
        cmd,
        shell=True,
        cwd=BASE_DIR,
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"  ✅ {name} başarıyla derlendi")
        return True
    else:
        print(f"  ❌ {name} derlenemedi:")
        for line in (result.stdout + result.stderr).splitlines():
            if line.strip():
                print(f"     {line}")
        return False

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("\n🔧 Monorepo Kalıcı Mimari Düzeltme")
    print("=" * 60)

    # ── 1. tsconfig.base.json ──────────────────────────────────────
    print("\n1. tsconfig.base.json temizleniyor (baseUrl + paths kaldırılıyor)...")
    sep()
    fix_tsconfig_base()
    sep()

    # ── 2 & 3. Paket tsconfig'leri ────────────────────────────────
    print("\n2. Paket tsconfig.json dosyaları güncelleniyor...")
    sep()
    for name, rel_dir in PACKAGES:
        pkg_dir = os.path.join(BASE_DIR, rel_dir)
        print(f"\n  [{name}]")
        fix_package_tsconfig(name, pkg_dir)
    sep()

    # ── 4. tsconfig.dev.json ───────────────────────────────────────
    print("\n3. IDE için tsconfig.dev.json oluşturuluyor...")
    sep()
    create_dev_tsconfig()
    sep()

    # ── 5. VSCode ayarları ─────────────────────────────────────────
    print("\n4. VSCode ayarları güncelleniyor...")
    sep()
    update_vscode_settings()
    sep()

    # ── 6. Dist temizliği ──────────────────────────────────────────
    print("\n5. Eski dist klasörleri temizleniyor...")
    sep()
    for name, rel_dir in PACKAGES:
        print(f"\n  [{name}]")
        clean_dist(os.path.join(BASE_DIR, rel_dir))
    sep()

    # ── 7. Derleme ─────────────────────────────────────────────────
    print("\n6. Paketler sırayla derleniyor...")
    sep()
    failed = []
    for name, rel_dir in PACKAGES:
        print(f"\n🔨 {name} derleniyor...")
        ok = build_package(name, os.path.join(BASE_DIR, rel_dir))
        if not ok:
            failed.append(name)
            print(f"\n⛔ {name} başarısız — kalan paketler atlanıyor.")
            break
    sep()

    # ── Sonuç ──────────────────────────────────────────────────────
    print("\n📊 SONUÇ")
    sep()
    built = [n for n, _ in PACKAGES if n not in failed]
    if not failed:
        print(f"✅ Tüm {len(PACKAGES)} paket başarıyla derlendi!")
        print("""
Artık her zaman sadece şunu çalıştır:
  cd packages/shared/shared-types   && npx tsc --build --force
  cd packages/shared/shared-core    && npx tsc --build --force
  ... (sırayla)

Veya root'tan:
  for pkg in shared-types shared-core shared-nest shared-security \\
             shared-messaging shared-observability shared-persistence; do
    npx tsc --build --force packages/shared/$pkg/tsconfig.json
  done

IDE'de IntelliSense için: tsconfig.dev.json (otomatik aktif)
""")
    else:
        print(f"✅ Başarılı  : {', '.join(built) if built else '—'}")
        print(f"❌ Başarısız : {', '.join(failed)}")
        print(f"\nYedekler .bak uzantısıyla kaydedildi. Geri almak için:")
        print(f"  find . -name '*.bak' | while read f; do mv \"$f\" \"${{f%.bak}}\"; done")
    sep()

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
