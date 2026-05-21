import { IVendor, ICompany, IListing, IEcosystemAuditLog } from '@barterborsa/shared-persistence';
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { MongoBrandEcosystemRepository } from '../infrastructure/persistence/mongo-brand-ecosystem.repository';
import { MongoEcosystemAuditLogRepository } from '../infrastructure/persistence/mongo-ecosystem-audit-log.repository';
import { IVendorRepository } from '../domain/repositories/vendor.repository.interface';
import { ITrustScoreRepository } from '../domain/repositories/trust-score.repository.interface';

export type EcosystemMemberDto = {
  id: string;
  businessName: string;
  tier: string;
  trustScore: number;
};

export type EcosystemDto = {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  status?: string;
  internalCommRate: number;
  isBlindPool: boolean;
  logoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  Owner: {
    businessName: string;
  };
  stats: {
    totalValue: number;
    totalStok: number;
    memberCount: number;
    listingCount: number;
    logCount: number;
  };
  Members: EcosystemMemberDto[];
};

export type EcosystemAuditLogDto = {
  id: string;
  ecosystemId?: string;
  vendorId?: string;
  action: string;
  severity: string;
  details?: Record<string, unknown>;
  createdAt?: Date;
  Vendor: {
    businessName: string;
  };
  Ecosystem: {
    name: string;
  };
};

@ApiTags('Ecosystem Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/ecosystems')
export class EcosystemAdminController {
  constructor(
    private readonly brandEcosystemRepo: MongoBrandEcosystemRepository,
    private readonly auditLogRepo: MongoEcosystemAuditLogRepository,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepo: ITrustScoreRepository,
    @InjectModel('Vendor') private readonly vendorModel: Model<IVendor>,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
    @InjectModel('Listing') private readonly listingModel: Model<IListing>,
    @InjectModel('EcosystemAuditLog') private readonly ecosystemAuditLogModel: Model<IEcosystemAuditLog>,
  ) {}

  @ApiOperation({ summary: 'Tüm ekosistemleri getir (Admin)' })
  @Get()
  async getEcosystems(): Promise<{ success: boolean; ecosystems: EcosystemDto[] }> {
    const ecosystems = await this.brandEcosystemRepo.findAll();
    
    const ecoIds = ecosystems.map(e => e.id);
    const ownerIds = ecosystems.map(e => e.ownerId).filter(Boolean);

    const [ownerVendors, memberVendors] = await Promise.all([
      ownerIds.length ? this.vendorModel.find({ id: { $in: ownerIds } }).lean().exec() : [],
      ecoIds.length ? this.vendorModel.find({ ecosystemId: { $in: ecoIds } }).lean().exec() : []
    ]);

    const allVendorIds = [...new Set([...ownerVendors.map(v => v.id), ...memberVendors.map(v => v.id)])];
    const allCompanyIds = [...new Set([...ownerVendors.map(v => v.companyId), ...memberVendors.map(v => v.companyId)])];

    const [companies, activeListings] = await Promise.all([
      allCompanyIds.length ? this.companyModel.find({ id: { $in: allCompanyIds } }).lean().exec() : [],
      allVendorIds.length ? this.listingModel.find({ vendorId: { $in: allVendorIds }, status: 'ACTIVE' }).lean().exec() : []
    ]);

    const trustScores = await Promise.all(memberVendors.map(mv => this.trustScoreRepo.findByVendorId(mv.id)));
    const trustScoreMap = new Map<string, any>(trustScores.filter(Boolean).map(ts => [ts!.vendorId, ts]));

    const companyMap = new Map<string, ICompany>(companies.map(c => [c.id, c] as [string, ICompany]));
    
    // Group member vendors by ecoId
    const membersByEcoId = new Map<string, import('@barterborsa/shared-persistence').IVendor[]>( );
    memberVendors.forEach(mv => {
      if (!membersByEcoId.has(mv.ecosystemId!)) membersByEcoId.set(mv.ecosystemId!, []);
      membersByEcoId.get(mv.ecosystemId!)!.push(mv);
    });

    // Group listings by vendorId
    const listingsByVendorId = new Map<string, IListing[]>( );
    activeListings.forEach(l => {
      if (!listingsByVendorId.has(l.vendorId)) listingsByVendorId.set(l.vendorId, []);
      listingsByVendorId.get(l.vendorId)!.push(l);
    });
    
    // Log counts
    const logCountsAgg = await this.ecosystemAuditLogModel.aggregate([
      { $match: { ecosystemId: { $in: ecoIds }, severity: { $ne: 'INFO' } } },
      { $group: { _id: '$ecosystemId', count: { $sum: 1 } } }
    ]).exec();
    const logCountsMap = new Map(logCountsAgg.map(agg => [agg._id, agg.count]));

    const result = ecosystems.map(eco => {
      const ownerVendor = ownerVendors.find(v => v.id === eco.ownerId);
      let ownerBusinessName = 'İsimsiz Fabrika';
      if (ownerVendor) {
        const ownerCompany = companyMap.get(ownerVendor.companyId);
        if (ownerCompany) ownerBusinessName = ownerCompany.name || 'İsimsiz Fabrika';
      }

      const membersList = [];
      const ecoMembers = membersByEcoId.get(eco.id) || [];
      for (const mv of ecoMembers) {
        const mvCompany = companyMap.get(mv.companyId);
        const tsRecord = trustScoreMap.get(mv.id);
        membersList.push({
          id: mv.id,
          businessName: mvCompany?.name || 'İsimsiz İşletme',
          tier: mv.tier || 'CORE',
          trustScore: tsRecord ? Number(tsRecord.score) : 100
        });
      }

      const relevantVendorIds = [eco.ownerId, ...ecoMembers.map(mv => mv.id)];
      let totalStok = 0;
      let totalValue = 0;
      let listingCount = 0;
      
      for (const vid of relevantVendorIds) {
        const vListings = listingsByVendorId.get(vid) || [];
        listingCount += vListings.length;
        for (const listing of vListings) {
          const stockVal = listing.stock || 0;
          const priceVal = listing.price ? Number(listing.price.toString()) : 0;
          totalStok += stockVal;
          totalValue += stockVal * priceVal;
        }
      }

      return {
        id: eco.id,
        name: eco.name,
        slug: eco.slug,
        description: eco.description,
        status: eco.status,
        internalCommRate: eco.internalCommRate ? Number(eco.internalCommRate.toString()) : 4.0,
        isBlindPool: eco.isBlindPool ?? true,
        logoUrl: eco.logoUrl,
        createdAt: eco.createdAt,
        updatedAt: eco.updatedAt,
        Owner: {
          businessName: ownerBusinessName
        },
        stats: {
          totalValue,
          totalStok,
          memberCount: ecoMembers.length,
          listingCount,
          logCount: logCountsMap.get(eco.id) || 0
        },
        Members: membersList
      };
    });

    return { success: true, ecosystems: result };
  }

  @ApiOperation({ summary: 'Tüm ekosistem denetim loglarını getir (Admin)' })
  @Get('logs')
  async getAuditLogs(): Promise<{ success: boolean; logs: EcosystemAuditLogDto[] }> {
    const logs = await this.ecosystemAuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean().exec();
    // Batch fetch vendors
    const vendorIds = [...new Set(logs.map(l => l.vendorId).filter(Boolean))];
    const vendors = vendorIds.length ? await this.vendorModel.find({ id: { $in: vendorIds } }).lean().exec() : [];
    const vendorMap = new Map<string, IVendor>(vendors.map(v => [v.id, v] as [string, IVendor]));

    // Batch fetch companies
    const companyIds = [...new Set(vendors.map(v => v.companyId).filter(Boolean))];
    const companies = companyIds.length ? await this.companyModel.find({ id: { $in: companyIds } }).lean().exec() : [];
    const companyMap = new Map<string, ICompany>(companies.map(c => [c.id, c] as [string, ICompany]));

    // Batch fetch ecosystems
    const ecoIdsFromLogs = logs.map(l => l.ecosystemId).filter(Boolean) as string[];
    const ecoIdsFromVendors = vendors.map(v => v.ecosystemId).filter(Boolean) as string[];
    const uniqueEcoIds = [...new Set([...ecoIdsFromLogs, ...ecoIdsFromVendors])];
    
    const ecosystems = await Promise.all(uniqueEcoIds.map(id => this.brandEcosystemRepo.findById(id)));
    const ecoMap = new Map<string, any>(ecosystems.filter(Boolean).map(e => [e!.id, e]));

    const result = logs.map(log => {
      let vendorBusinessName = 'SİSTEM';
      let vendorEcosystemId = null;
      
      if (log.vendorId) {
        const vendor = vendorMap.get(log.vendorId);
        if (vendor) {
          vendorEcosystemId = vendor.ecosystemId;
          const company = companyMap.get(vendor.companyId);
          if (company) {
            vendorBusinessName = company.name || 'İsimsiz Satıcı';
          }
        }
      }

      let ecosystemName = 'GENEL HAVUZ';
      const ecoId = log.ecosystemId || vendorEcosystemId;
      if (ecoId) {
        const eco = ecoMap.get(ecoId);
        if (eco) {
          ecosystemName = eco.name || 'İsimsiz Ekosistem';
        }
      }

      return {
        id: log.id,
        ecosystemId: log.ecosystemId,
        vendorId: log.vendorId,
        action: log.action,
        severity: log.severity,
        details: log.details,
        createdAt: log.createdAt,
        Vendor: {
          businessName: vendorBusinessName
        },
        Ecosystem: {
          name: ecosystemName
        }
      };
    });

    return { success: true, logs: result };
  }

  @ApiOperation({ summary: 'Bayi TrustScore güncelle/override et (Admin)' })
  @Post('trust-score')
  async updateTrustScore(
    @Body() body: { vendorId: string; newScore: number; reason: string },
    @CurrentUser() admin: { id: string }
  ) {
    const { vendorId, newScore, reason } = body;
    
    const vendor = await this.vendorModel.findOne({ id: vendorId }).lean().exec();
    if (!vendor) {
      throw new NotFoundException('Bayi bulunamadı');
    }
    
    const oldRecord = await this.trustScoreRepo.findByVendorId(vendorId);
    const oldScore = oldRecord ? Number(oldRecord.score) : 100;
    
    // Save/update score
    const { scoreToLevel } = require('../../../barter/domain/trust-level.constants');
    await this.trustScoreRepo.upsert(vendorId, {
      score:              newScore,
      tradingPerformance: oldRecord ? Number(oldRecord.tradingPerformance) : 100,
      xpLoyalty:          oldRecord ? Number(oldRecord.xpLoyalty) : 100,
      compliance:         oldRecord ? Number(oldRecord.compliance) : 100,
      level:              scoreToLevel(newScore, oldRecord?.isFrozen ?? false),
    });
    
    // Log trust score override
    await this.auditLogRepo.create({
      ecosystemId: vendor.ecosystemId || 'SYSTEM',
      vendorId: vendorId,
      action: 'TRUST_SCORE_OVERRIDE',
      severity: 'WARN',
      details: {
        oldScore,
        newScore,
        reason,
        vendorId
      }
    });
    
    return { success: true };
  }

  @ApiOperation({ summary: 'Ekosistemden üye çıkar (Admin)' })
  @Delete('members/:vendorId')
  async removeMember(
    @Param('vendorId') memberVendorId: string,
    @CurrentUser() admin: { id: string }
  ) {
    const memberVendor = await this.vendorModel.findOne({ id: memberVendorId }).lean().exec();
    if (!memberVendor) {
      throw new NotFoundException('Üye bayi bulunamadı');
    }
    if (!memberVendor.ecosystemId) {
      throw new BadRequestException('Bu bayi herhangi bir ekosisteme üye değil');
    }
    
    const ecosystemId = memberVendor.ecosystemId;
    
    // Set ecosystemId to null/undefined
    await this.vendorModel.updateOne({ id: memberVendorId }, { $unset: { ecosystemId: "" } }).exec();
    
    // Log removal
    await this.auditLogRepo.create({
      ecosystemId,
      vendorId: memberVendorId,
      action: 'MEMBER_REMOVED',
      severity: 'HIGH',
      details: { removedBy: admin.id },
    });
    
    return { success: true };
  }
}
