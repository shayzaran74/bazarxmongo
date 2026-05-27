// apps/backend/src/modules/tax/application/services/tax-calculator.service.ts
// Master Plan v4.3 §5 — Vergisel Yükümlülükler

import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';

// Sabitler (Master Plan §5.2)
const KDV_RATE         = 0.20;  // %20 KDV
const SERVICE_FEE_RATE = 0.08;  // %8 hizmet bedeli
const STOPAJ_RATE      = 0.10;  // %10 stopaj (TicariTakas)
const KV_RATE_ANNUAL   = 0.25;  // %25 kurumlar vergisi (yıllık → aylık bölünür)
const DAMGA_RATE       = 0.001; // ‰1 damga vergisi

export interface BazarXTaxBreakdown {
  // Tahakkuk
  aidatKdv:      number; // aidat + satıcı komisyonu + reklam üzerinden %20
  hizmetKdv:     number; // hizmet bedeli üzerinden %20
  toplamKdvT:    number; // toplam tahakkuk
  // İndirim
  indirilecekKdv: number; // gider KDV'si (%18 indirim varsayımı)
  // Net
  netKdv:        number;
  damgaVergisi:  number;
}

export interface TicariTakasTaxBreakdown {
  kdvTahakkuk:   number; // tüm gelir × %20
  stopaj:        number; // komisyon geliri × %10
  toplamYuk:     number;
}

export interface KurumlarVergisiBreakdown {
  brutGelir:     number;
  toplam:        number; // yıllık %25 → aylık
  aylikKarsilik: number;
}

export interface ConsolidatedTax {
  bazarX:          BazarXTaxBreakdown;
  ticariTakas:     TicariTakasTaxBreakdown;
  kurumlarVergisi: KurumlarVergisiBreakdown;
  toplamAylikYuk:  number;
}

@Injectable()
export class TaxCalculatorService {
  // BazarX KDV (§5.2 — matrah yalnızca hizmet bedeli)
  calculateBazarXTax(params: {
    aidatGeliri:   number;
    saticiKomisyon: number;
    reklamGeliri:  number;
    hizmetBedeli:  number;  // %8 × indirimli menü
    giderler:      number;
  }): BazarXTaxBreakdown {
    const d = (n: number) => new Decimal(n);

    // ⚠️ R1 — Master Plan v4.3 §5.2 KDV matrah kuralı:
    // KDV matrahı YALNIZCA %8 hizmet bedelidir; menü tutarının TAMAMI üzerinden değil.
    // Örnek: 1.000₺ menü → %50 indirim = 500₺, hizmet = 500×%8 = 40₺, KDV = 40×%20 = 8₺
    // Bu satırı değiştirirken dikkat: params.hizmetBedeli zaten %8 hesaplanmış tutardır.
    const hizmetKdv  = d(params.hizmetBedeli).mul(KDV_RATE).toDecimalPlaces(2);

    // Diğer gelirler üzerinden KDV (aidat + satıcı kom. + reklam)
    const diger      = d(params.aidatGeliri).plus(params.saticiKomisyon).plus(params.reklamGeliri);
    const aidatKdv   = diger.mul(KDV_RATE).toDecimalPlaces(2);
    const toplamKdvT = aidatKdv.plus(hizmetKdv);

    // Gider KDV indirimi (giderlerin %18'i KDV kabul edilir)
    const indirilecekKdv = d(params.giderler).mul(0.18).toDecimalPlaces(2);
    const netKdv         = Decimal.max(0, toplamKdvT.sub(indirilecekKdv)).toDecimalPlaces(2);

    const damgaVergisi = d(params.aidatGeliri).plus(params.saticiKomisyon)
      .plus(params.reklamGeliri).mul(DAMGA_RATE).toDecimalPlaces(2);

    return {
      aidatKdv:       aidatKdv.toNumber(),
      hizmetKdv:      hizmetKdv.toNumber(),
      toplamKdvT:     toplamKdvT.toNumber(),
      indirilecekKdv: indirilecekKdv.toNumber(),
      netKdv:         netKdv.toNumber(),
      damgaVergisi:   damgaVergisi.toNumber(),
    };
  }

  // TicariTakas KDV + Stopaj
  calculateTicariTakasTax(params: {
    aidatGeliri:    number;
    komisyonGeliri: number;
    reklamGeliri:   number;
  }): TicariTakasTaxBreakdown {
    const d = (n: number) => new Decimal(n);

    const toplamGelir = d(params.aidatGeliri).plus(params.komisyonGeliri).plus(params.reklamGeliri);
    const kdvTahakkuk = toplamGelir.mul(KDV_RATE).toDecimalPlaces(2);
    const stopaj      = d(params.komisyonGeliri).mul(STOPAJ_RATE).toDecimalPlaces(2);

    return {
      kdvTahakkuk: kdvTahakkuk.toNumber(),
      stopaj:      stopaj.toNumber(),
      toplamYuk:   kdvTahakkuk.plus(stopaj).toNumber(),
    };
  }

  // Kurumlar vergisi aylık karşılık (§5.2)
  calculateKurumlarVergisi(params: {
    brutGelir:    number;
    toplamGider:  number;
    odenenKdv:    number;
  }): KurumlarVergisiBreakdown {
    const matrah       = Math.max(0, params.brutGelir - params.toplamGider - params.odenenKdv);
    const yillik       = matrah * KV_RATE_ANNUAL;
    const aylikKarsilik = yillik / 12;

    return {
      brutGelir:     params.brutGelir,
      toplam:        Math.round(yillik * 100) / 100,
      aylikKarsilik: Math.round(aylikKarsilik * 100) / 100,
    };
  }

  // Konsolide aylık vergi raporu
  calculateConsolidated(params: {
    bazarX: {
      aidatGeliri:    number;
      saticiKomisyon: number;
      reklamGeliri:   number;
      hizmetBedeli:   number;
      giderler:       number;
    };
    ticariTakas: {
      aidatGeliri:    number;
      komisyonGeliri: number;
      reklamGeliri:   number;
      giderler:       number;
    };
  }): ConsolidatedTax {
    const bx   = this.calculateBazarXTax(params.bazarX);
    const tt   = this.calculateTicariTakasTax(params.ticariTakas);

    const brutGelirBx = params.bazarX.aidatGeliri + params.bazarX.saticiKomisyon
      + params.bazarX.reklamGeliri + params.bazarX.hizmetBedeli;
    const brutGelirTt = params.ticariTakas.aidatGeliri + params.ticariTakas.komisyonGeliri
      + params.ticariTakas.reklamGeliri;

    const kv = this.calculateKurumlarVergisi({
      brutGelir:   brutGelirBx + brutGelirTt,
      toplamGider: params.bazarX.giderler + params.ticariTakas.giderler,
      odenenKdv:   bx.netKdv + tt.kdvTahakkuk,
    });

    const toplamAylikYuk = bx.netKdv + bx.damgaVergisi + tt.toplamYuk + kv.aylikKarsilik;

    return {
      bazarX:          bx,
      ticariTakas:     tt,
      kurumlarVergisi: kv,
      toplamAylikYuk:  Math.round(toplamAylikYuk * 100) / 100,
    };
  }
}
