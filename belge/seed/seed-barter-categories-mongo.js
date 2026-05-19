import mongoose from 'mongoose';
import { Category } from '../../packages/shared/shared-persistence/src/schemas/backend/category.schema.ts';
import { SurplusCategory } from '../../packages/shared/shared-persistence/src/schemas/backend/surplusCategory.schema.ts';

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

function formatName(name) {
    if (!name) return name
    return name
        .toLocaleLowerCase('tr-TR')
        .split(' ')
        .map(word => {
            if (!word) return ''
            return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1)
        })
        .join(' ')
}

const barterCategories = [
    {
        name: 'İnşaat, Gayrimenkul ve Yapı Malzemeleri',
        slug: 'insaat-gayrimenkul-yapi',
        icon: 'BuildingOfficeIcon',
        description: 'İnşaat projeleri, gayrimenkul alım-satımı ve yapı malzemeleri tedariği.',
        children: [
            {
                name: 'Gayrimenkul',
                slug: 'gayrimenkul',
                icon: 'HomeIcon',
                children: [
                    { name: 'Konut', slug: 'konut' },
                    { name: 'Ticari Dükkan', slug: 'ticari-dukkan' },
                    { name: 'Arsa', slug: 'arsa' },
                    { name: 'Ofis Katı', slug: 'ofis-kati' },
                    { name: 'Villa', slug: 'villa' },
                    { name: 'Devre Mülk', slug: 'devre-mulk' }
                ]
            },
            {
                name: 'Yapı Malzemeleri',
                slug: 'yapi-malzemeleri',
                icon: 'WrenchScrewdriverIcon',
                children: [
                    { name: 'Hazır Beton', slug: 'hazir-beton' },
                    { name: 'Demir-Çelik', slug: 'demir-celik' },
                    { name: 'Seramik ve Vitrifiye', slug: 'seramik-vitrifiye' },
                    { name: 'Boya ve Yalıtım', slug: 'boya-yalitim' },
                    { name: 'PVC/Alüminyum Doğrama', slug: 'pvc-aluminyum' },
                    { name: 'Elektrik ve Aydınlatma', slug: 'elektrik-aydinlatma' }
                ]
            },
            {
                name: 'Hizmetler',
                slug: 'insaat-hizmetleri',
                icon: 'UserGroupIcon',
                children: [
                    { name: 'Mimari ve Statik Proje', slug: 'mimari-statik' },
                    { name: 'İç Mimarlık ve Dekorasyon', slug: 'ic-mimarlik' },
                    { name: 'Zemin Etüdü', slug: 'zemin-etudu' },
                    { name: 'Harita Mühendisliği', slug: 'harita-muhendisligi' }
                ]
            },
            {
                name: 'Teknik Donanım',
                slug: 'teknik-donanim',
                icon: 'WrenchIcon',
                children: [
                    { name: 'Asansör ve Yürüyen Merdiven', slug: 'asansor' },
                    { name: 'Isıtma-Soğutma (HVAC)', slug: 'hvac' }
                ]
            }
        ]
    },
    {
        name: 'Medya, Reklam ve Tanıtım',
        slug: 'medya-reklam-tanitim',
        icon: 'MegaphoneIcon',
        description: 'Televizyon, radyo, dijital ve basılı reklam mecraları.',
        children: [
            {
                name: 'Mecralar',
                slug: 'mecralar',
                icon: 'TicketIcon',
                children: [
                    { name: 'TV ve Radyo Reklamları', slug: 'tv-radyo-reklam' },
                    { name: 'Gazete ve Dergi İlanları', slug: 'gazete-dergi-ilan' },
                    { name: 'Açık Hava (Outdoor)', slug: 'outdoor-reklam' }
                ]
            },
            {
                name: 'Dijital',
                slug: 'dijital-medya',
                icon: 'GlobeAltIcon',
                children: [
                    { name: 'Dijital Pazarlama ve SEO', slug: 'dijital-pazarlama-seo' },
                    { name: 'Sosyal Medya Yönetimi', slug: 'sosyal-medya-yonetimi' },
                    { name: 'Web Tasarımı', slug: 'web-tasarimi' }
                ]
            },
            {
                name: 'Prodüksiyon ve Baskı',
                slug: 'produksiyon-baski',
                icon: 'PrinterIcon',
                children: [
                    { name: 'Video ve Prodüksiyon', slug: 'video-produksiyon' },
                    { name: 'Matbaa ve Basım', slug: 'matbaa-basim' },
                    { name: 'Katalog ve Broşür', slug: 'katalog-brosur' }
                ]
            }
        ]
    },
    {
        name: 'Turizm, Konaklama ve Organizasyon',
        slug: 'turizm-konaklama-organizasyon',
        icon: 'GlobeEuropeAfricaIcon',
        description: 'Otel konaklamaları, seyahat hizmetleri ve etkinlik organizasyonu.',
        children: [
            {
                name: 'Konaklama',
                slug: 'konaklama',
                icon: 'BuildingOffice2Icon',
                children: [
                    { name: 'Şehir Otelleri', slug: 'sehir-otelleri' },
                    { name: 'Resort ve Tatil Köyleri', slug: 'tatil-koyleri' }
                ]
            },
            {
                name: 'Seyahat',
                slug: 'seyahat',
                icon: 'TruckIcon',
                children: [
                    { name: 'Uçak Bileti', slug: 'ucak-bileti' },
                    { name: 'Araç Kiralama (Rent-a-car)', slug: 'arac-kiralama' },
                    { name: 'VIP Transfer', slug: 'vip-transfer' },
                    { name: 'Personel Taşımacılığı', slug: 'personel-tasimaciligi' }
                ]
            },
            {
                name: 'Organizasyon',
                slug: 'organizasyon',
                icon: 'SparklesIcon',
                children: [
                    { name: 'Bayi Toplantıları', slug: 'bayi-toplantilari' },
                    { name: 'Eğitim ve Seminer', slug: 'egitim-seminer' },
                    { name: 'Lansman ve Fuar Standı', slug: 'lansman-fuar' }
                ]
            }
        ]
    },
    {
        name: 'Hizmet ve Danışmanlık Sektörü',
        slug: 'hizmet-danismanlik',
        icon: 'UserGroupIcon',
        description: 'Kurumsal danışmanlık, hukuk, denetim ve operasyonel hizmetler.',
        children: [
            {
                name: 'Kurumsal Hizmetler',
                slug: 'kurumsal-hizmetler',
                icon: 'BriefcaseIcon',
                children: [
                    { name: 'Hukuki Danışmanlık', slug: 'hukuk-danismanlik' },
                    { name: 'Mali Müşavirlik ve Denetim', slug: 'mali-musavirlik' },
                    { name: 'Gümrükleme', slug: 'gumrukleme' },
                    { name: 'Marka ve Patent Tescili', slug: 'marka-patent' },
                    { name: 'ISO Belgelendirme', slug: 'iso-belgelendirme' }
                ]
            },
            {
                name: 'Operasyonel Hizmetler',
                slug: 'operasyonel-hizmetler',
                icon: 'GearIcon',
                children: [
                    { name: 'Özel Güvenlik', slug: 'ozel-guvenlik' },
                    { name: 'Temizlik Hizmetleri', slug: 'temizlik-hizmetleri' },
                    { name: 'Kargo ve Lojistik', slug: 'kargo-lojistik' },
                    { name: 'Catering (Yemek)', slug: 'catering' }
                ]
            },
            {
                name: 'Bireysel ve Diğer',
                slug: 'bireysel-hizmetler',
                icon: 'HeartIcon',
                children: [
                    { name: 'Eğitim Kurumları', slug: 'egitim-kurumlari' },
                    { name: 'Sağlık Hizmetleri', slug: 'saglik-hizmetleri' },
                    { name: 'Sanatçı ve Mankenlik', slug: 'sanatci-mankenlik' }
                ]
            }
        ]
    },
    {
        name: 'Sanayi, Üretim ve Enerji',
        slug: 'sanayi-uretim-enerji',
        icon: 'BoltIcon',
        description: 'Hammadde tedariği, endüstriyel makine ve enerji sistemleri.',
        children: [
            {
                name: 'Hammadde ve Yarı Mamul',
                slug: 'hammadde-yari-mamul',
                icon: 'CubeIcon',
                children: [
                    { name: 'Tekstil Hammaddeleri', slug: 'tekstil-hammadde' },
                    { name: 'Kimyasal Maddeler', slug: 'kimyasal-maddeler' },
                    { name: 'Plastik ve Ambalaj', slug: 'plastik-ambalaj' }
                ]
            },
            {
                name: 'Makine ve Ekipman',
                slug: 'makine-ekipman',
                icon: 'WrenchIcon',
                children: [
                    { name: 'Endüstriyel Makineler', slug: 'endustriyel-makineler' },
                    { name: 'Yedek Parça', slug: 'yedek-parca' },
                    { name: 'Jeneratörler', slug: 'jenerator' }
                ]
            },
            {
                name: 'Enerji ve Akaryakıt',
                slug: 'enerji-akaryakit',
                icon: 'FireIcon',
                children: [
                    { name: 'Petrol Ürünleri', slug: 'petrol-urunleri' },
                    { name: 'Petro-Kimya', slug: 'petro-kimya' }
                ]
            }
        ]
    },
    {
        name: 'Perakende, Gıda ve Tüketim Malları',
        slug: 'perakende-gida-tuketim',
        icon: 'ShoppingCartIcon',
        description: 'Gıda ürünleri, hazır giyim ve mobilya/beyaz eşya.',
        children: [
            {
                name: 'Gıda',
                slug: 'gida',
                icon: 'CakeIcon',
                children: [
                    { name: 'Paketli Gıda ve İçecek', slug: 'paketli-gida' },
                    { name: 'Restoran ve Kafe', slug: 'restoran-kafe' },
                    { name: 'Market Çekleri', slug: 'market-cekleri' }
                ]
            },
            {
                name: 'Tekstil ve Moda',
                slug: 'tekstil-moda',
                icon: 'ShoppingBagIcon',
                children: [
                    { name: 'Hazır Giyim ve Ayakkabı', slug: 'hazir-giyim-ayakkabi' },
                    { name: 'Ev Tekstili ve Mefruşat', slug: 'ev-tekstili' }
                ]
            },
            {
                name: 'Dayanıklı Tüketim',
                slug: 'dayanikli-tuketim',
                icon: 'ComputerDesktopIcon',
                children: [
                    { name: 'Beyaz Eşya ve Mobilya', slug: 'beyaz-esya-mobilya' },
                    { name: 'Elektronik ve Bilgisayar', slug: 'elektronik-bilgisayar' }
                ]
            }
        ]
    }
];

async function main() {
    console.log('🌱 Barter kategorileri ekleniyor (MongoDB)...');
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        async function upsertHierarchicalCategories(categories, parentId = null, surplusParentId = null) {
            for (const cat of categories) {
                const formattedName = formatName(cat.name);
                
                // 1. Category Table
                const catData = {
                    id: cat.slug, // Use slug as ID if not provided, or generate one
                    name: formattedName,
                    slug: cat.slug,
                    description: cat.description || '',
                    parentId: parentId,
                    icon: cat.icon || 'Squares2X2Icon',
                    isActive: true,
                    colorFrom: 'from-blue-400',
                    colorTo: 'to-amber-500',
                    hoverColor: 'group-hover:text-gray-600',
                    shadowColor: 'shadow-gray-200',
                    type: 'GENERAL'
                };
                
                const created = await Category.findOneAndUpdate(
                    { slug: cat.slug },
                    { $set: catData },
                    { upsert: true, new: true }
                );
                
                // 2. Surplus Category Table
                const surplusData = {
                    id: cat.slug,
                    name: formattedName,
                    slug: cat.slug,
                    icon: cat.icon || 'Squares2X2Icon',
                    parentId: surplusParentId,
                    isActive: true
                };
                
                const createdSurplus = await SurplusCategory.findOneAndUpdate(
                    { name: formattedName },
                    { $set: surplusData },
                    { upsert: true, new: true }
                );
                
                if (cat.children && cat.children.length > 0) {
                    await upsertHierarchicalCategories(cat.children, created.id, createdSurplus.id);
                }
            }
        }
        
        await upsertHierarchicalCategories(barterCategories);
        
        // Extra flat categories
        const extraSectors = [
            'Lojistik', 'Sigorta', 'Kozmetik', 'Fuarcılık', 'Marketler zinciri'
        ];
        
        for (const sector of extraSectors) {
            const formattedName = formatName(sector);
            const slug = formattedName
                .toLocaleLowerCase('tr-TR')
                .replace(/ /g, '-')
                .replace(/[ıİ]/g, 'i')
                .replace(/[ğĞ]/g, 'g')
                .replace(/[üÜ]/g, 'u')
                .replace(/[şŞ]/g, 's')
                .replace(/[öÖ]/g, 'o')
                .replace(/[çÇ]/g, 'c')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-');
                
            await SurplusCategory.findOneAndUpdate(
                { name: formattedName },
                { $set: { name: formattedName, isActive: true, slug, id: slug } },
                { upsert: true }
            );
        }
        
        console.log('✅ Barter kategorileri başarıyla güncellendi!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
