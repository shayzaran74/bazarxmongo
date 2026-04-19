import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const processObj: any = (globalThis as any).process || {};
const globalObj: any = globalThis || {};

/**
 * seed-test.ts
 * 
 * Veritabanı verilerini doğrulamak ve temel tabloları test etmek için geliştirilmiş script.
 * 
 * Kullanım:
 * npx tsx prisma/seed-test.ts --table=User --action=verify
 * npx tsx prisma/seed-test.ts --table=CatalogProduct --action=stats
 */

async function main() {
    // Komut satırı parametrelerini çözümle
    const args: string[] = processObj.argv.slice(2);
    const params: Record<string, string> = {};
    
    args.forEach((arg: string) => {
        if (arg.startsWith('--')) {
            const parts = arg.replace('--', '').split('=');
            const key = parts[0];
            const value = parts[1] || 'true';
            params[key] = value;
        }
    });

    const table = params.table;
    const action = params.action || 'stats';

    console.log(`\n🚀 [Seed-Test] İşlem başlatılıyor: Table=${table || 'ALL'}, Action=${action}`);

    if (!table) {
        await showGlobalStats();
    } else {
        switch (table) {
            case 'User':
                await handleUserActions(action);
                break;
            case 'Vendor':
                await handleVendorActions(action);
                break;
            case 'CatalogProduct':
                await handleCatalogProductActions(action);
                break;
            case 'Listing':
                await handleListingActions(action);
                break;
            default:
                console.error(`❌ Hata: '${table}' tablosu desteklenmiyor veya bulunamadı.`);
        }
    }
}

async function showGlobalStats() {
    try {
        const [u, v, c, l] = await Promise.all([
            prisma.user.count(),
            (prisma as any).vendor.count(),
            (prisma as any).catalogProduct.count(),
            (prisma as any).listing.count()
        ]);

        console.log('\n📊 [Global İstatistikler]');
        console.table({
            'Kullanıcılar': u,
            'Satıcılar': v,
            'Katalog Ürünleri': c,
            'İlanlar': l
        });
    } catch (error: any) {
        console.error('❌ İstatistikler alınırken hata oluştu:', error.message);
    }
}

async function handleUserActions(action: string) {
    if (action === 'verify') {
        const users = await prisma.user.findMany({
            include: { profile: true }
        });
        const usersWithoutProfiles = users.filter(u => !u.profile);
        
        console.log(`🔍 Profili olmayan kullanıcılar: ${usersWithoutProfiles.length}`);
        
        const allUsers = await prisma.user.findMany({});
        const superAdmins = allUsers.filter((u: any) => 
            u.isSuperAdmin === true || 
            u.is_super_admin === true || 
            String(u.isSuperAdmin) === 'true'
        );
        
        console.log(`🛡️ Super Admin sayısı: ${superAdmins.length}`);
    } else {
        const stats = await prisma.user.groupBy({
            by: ['role'],
            _count: { id: true }
        });
        console.log('\n👤 Kullanıcı Rol Dağılımı');
        console.table(stats);
    }
}

async function handleVendorActions(action: string) {
    if (action === 'verify') {
        const vendors = await (prisma as any).vendor.findMany({
            include: { user: { select: { email: true } } }
        });
        const inactiveVendors = vendors.filter((v: any) => v.status !== 'ACTIVE');
        console.log(`⌛ Onay bekleyen/Pasif satıcılar: ${inactiveVendors.length}`);
    } else {
        const stats = await (prisma as any).vendor.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        console.log('\n🏪 Satıcı Durumları');
        console.table(stats);
    }
}

async function handleCatalogProductActions(action: string) {
    if (action === 'verify') {
        const products = await (prisma as any).catalogProduct.findMany({});
        const productsWithoutCategory = products.filter((p: any) => !p.categoryId);
        console.log(`📂 Kategorisiz katalog ürünleri: ${productsWithoutCategory.length}`);
    } else {
        const count = await (prisma as any).catalogProduct.count();
        console.log(`📦 Toplam Katalog Ürünü: ${count}`);
    }
}

async function handleListingActions(action: string) {
    if (action === 'verify') {
        const listings = await (prisma as any).listing.findMany({});
        const orphanListings = listings.filter((l: any) => !l.catalogProductId);
        console.log(`⚠️ Katalog kaydı olmayan ilanlar: ${orphanListings.length}`);
    } else {
        const stats = await (prisma as any).listing.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        console.log('\n📝 İlan Durumları');
        console.table(stats);
    }
}

main()
    .catch((e) => {
        console.error(e);
        processObj.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
