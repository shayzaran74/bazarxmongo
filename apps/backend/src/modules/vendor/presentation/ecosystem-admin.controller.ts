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
  async getEcosystems(): Promise<{ success: boolean; ecosystems: any[] }> {
    const ecosystems = await this.brandEcosystemRepo.findAll();
    
    const result = [];
    for (const eco of ecosystems) {
      // Find owner vendor and company name
      const ownerVendor = await this.vendorRepo.findById(eco.ownerId);
      let ownerBusinessName = 'İsimsiz Fabrika';
      if (ownerVendor) {
        const ownerCompany = await this.companyModel.findOne({ id: ownerVendor.companyId }).lean().exec();
        if (ownerCompany) {
          ownerBusinessName = ownerCompany.name || 'İsimsiz Fabrika';
        }
      }
      
      // Find members (vendors with ecosystemId = eco.id)
      const memberVendors = await this.vendorModel.find({ ecosystemId: eco.id }).lean().exec();
      const membersList = [];
      
      for (const mv of memberVendors) {
        const mvCompany = await this.companyModel.findOne({ id: mv.companyId }).lean().exec();
        const tsRecord = await this.trustScoreRepo.findByVendorId(mv.id);
        membersList.push({
          id: mv.id,
          businessName: mvCompany?.name || 'İsimsiz İşletme',
          tier: mv.tier || 'CORE',
          trustScore: tsRecord ? Number(tsRecord.score) : 100
        });
      }
      
      // Calculate active listings and stocks
      const relevantVendorIds = [eco.ownerId, ...memberVendors.map(mv => mv.id)];
      const activeListings = await this.listingModel.find({
        vendorId: { $in: relevantVendorIds },
        status: 'ACTIVE'
      }).lean().exec();
      
      let totalStok = 0;
      let totalValue = 0;
      for (const listing of activeListings) {
        const stockVal = listing.stock || 0;
        const priceVal = listing.price ? Number(listing.price.toString()) : 0;
        totalStok += stockVal;
        totalValue += stockVal * priceVal;
      }
      
      const logCount = await this.ecosystemAuditLogModel.countDocuments({
        ecosystemId: eco.id,
        severity: { $ne: 'INFO' }
      }).exec();
      
      result.push({
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
          memberCount: memberVendors.length,
          listingCount: activeListings.length,
          logCount
        },
        Members: membersList
      });
    }
    
    return { success: true, ecosystems: result };
  }

  @ApiOperation({ summary: 'Tüm ekosistem denetim loglarını getir (Admin)' })
  @Get('logs')
  async getAuditLogs(): Promise<{ success: boolean; logs: any[] }> {
    const logs = await this.ecosystemAuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean().exec();
    
    const result = [];
    for (const log of logs) {
      // Find vendor business name
      let vendorBusinessName = 'SİSTEM';
      let vendorEcosystemId = null;
      if (log.vendorId) {
        const vendor = await this.vendorModel.findOne({ id: log.vendorId }).lean().exec();
        if (vendor) {
          vendorEcosystemId = vendor.ecosystemId;
          const company = await this.companyModel.findOne({ id: vendor.companyId }).lean().exec();
          if (company) {
            vendorBusinessName = company.name || 'İsimsiz Satıcı';
          }
        }
      }
      
      // Find ecosystem name
      let ecosystemName = 'GENEL HAVUZ';
      const ecoId = log.ecosystemId || vendorEcosystemId;
      if (ecoId) {
        const eco = await this.brandEcosystemRepo.findById(ecoId);
        if (eco) {
          ecosystemName = eco.name || 'İsimsiz Ekosistem';
        }
      }
      
      result.push({
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
      });
    }
    
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
