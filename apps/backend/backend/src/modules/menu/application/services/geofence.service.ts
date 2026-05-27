// apps/backend/src/modules/menu/application/services/geofence.service.ts
// BazarX-GO §10 — Konum bazlı sürpriz menü tetikleyici
// Haversine + VendorProfile'dan koordinat çekme (artık client'a bağımlı değil)

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ISurpriseMenu, IUserDeviceToken } from '@barterborsa/shared-persistence';

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearbyResult {
  vendorId:     string;
  listingId:    string;
  distanceKm:   number;
  radiusMeters: number;
}

interface VendorCoord { vendorId: string; lat: number; lng: number }

@Injectable()
export class GeofenceService {
  private readonly logger = new Logger(GeofenceService.name);

  constructor(
    @InjectModel('SurpriseMenu')    private readonly surpriseModel: Model<ISurpriseMenu>,
    @InjectModel('UserDeviceToken') private readonly tokenModel:    Model<IUserDeviceToken>,
  ) {}

  /**
   * Kullanıcının konumunu güncelle + DB'den vendor koordinatlarını çek + yakın sürpriz menüleri bul.
   * §10 — Artık vendorCoords client'tan gelmiyor, VendorProfile'dan otomatik çekiliyor.
   */
  async updateLocationAndFindNearby(
    userId: string,
    lat:    number,
    lng:    number,
  ): Promise<NearbyResult[]> {
    // Kullanıcının son konumunu güncelle
    await this.tokenModel.updateMany(
      { userId, isActive: true },
      { $set: { lastLat: lat, lastLng: lng, lastLocationAt: new Date() } },
    );

    // Aktif sürpriz menüleri çek
    const now     = new Date();
    const hourStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const activeSurprises = await this.surpriseModel
      .find({ isActive: true })
      .lean<ISurpriseMenu[]>();

    // Aktif saat bloğunda ve kota dolmamış olanlar
    const inWindow = activeSurprises.filter(s => {
      if (s.usedToday >= s.dailyQuota) return false;
      return s.activeHours.some(h => hourStr >= h.start && hourStr <= h.end);
    });

    if (inWindow.length === 0) return [];

    // Vendor koordinatlarını VendorProfile'dan çek
    const vendorIds = inWindow.map(s => s.vendorId);
    const { VendorProfile } = require('@barterborsa/shared-persistence/schemas/backend/vendorProfile.schema');
    const profiles = await VendorProfile
      .find({ vendorId: { $in: vendorIds }, lat: { $exists: true }, lng: { $exists: true } }, { vendorId: 1, lat: 1, lng: 1 })
      .lean() as { vendorId: string; lat: number; lng: number }[];

    const coordMap = new Map<string, VendorCoord>(profiles.map(p => [p.vendorId, p]));

    // Mesafe hesabı
    const nearby: NearbyResult[] = [];
    for (const s of inWindow) {
      const vc = coordMap.get(s.vendorId);
      if (!vc) continue; // koordinatı olmayan vendor atla

      const distKm = haversineKm(lat, lng, vc.lat, vc.lng);
      const distM  = distKm * 1000;

      if (distM <= s.radiusMeters) {
        nearby.push({
          vendorId:    s.vendorId,
          listingId:   s.listingId,
          distanceKm:  Math.round(distKm * 100) / 100,
          radiusMeters:s.radiusMeters,
        });
      }
    }

    if (nearby.length > 0) {
      this.logger.log(`${nearby.length} yakın sürpriz menü: userId=${userId} (${lat},${lng})`);
    }

    return nearby;
  }

  isWithinRadius(
    userLat: number, userLng: number,
    vendorLat: number, vendorLng: number,
    radiusMeters = 500,
  ): boolean {
    return haversineKm(userLat, userLng, vendorLat, vendorLng) * 1000 <= radiusMeters;
  }
}
