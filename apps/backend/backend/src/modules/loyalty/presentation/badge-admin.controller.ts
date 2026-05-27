import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsObject, MinLength } from 'class-validator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { IBadgeRule, IListing } from '@barterborsa/shared-persistence';
import { escapeRegExp } from '../../../common/utils/regex.utils';

class CreateBadgeRuleDto {
  @IsString() @MinLength(1) code!: string;
  @IsString() @MinLength(1) displayText!: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsNumber() priority?: number;
  @IsOptional() @IsString() backgroundColor?: string;
  @IsOptional() @IsString() textColor?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) targetEcosystem?: string[];
  @IsOptional() @IsObject() conditionJson?: Record<string, unknown>;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class UpdateBadgeRuleDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() displayText?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsNumber() priority?: number;
  @IsOptional() @IsString() backgroundColor?: string;
  @IsOptional() @IsString() textColor?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) targetEcosystem?: string[];
  @IsOptional() @IsObject() conditionJson?: Record<string, unknown>;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@ApiTags('Badge Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/badge-rules')
export class BadgeAdminController {
  constructor(
    @InjectModel('BadgeRule') private readonly badgeRuleModel: Model<IBadgeRule>,
    @InjectModel('Listing') private readonly listingModel: Model<IListing>,
  ) {}

  @ApiOperation({ summary: 'List all badge rules' })
  @Get()
  async listBadgeRules() {
    const rules = await this.badgeRuleModel.find().sort({ priority: -1 }).lean().exec();
    return { success: true, data: rules };
  }

  @ApiOperation({ summary: 'Create a new badge rule' })
  @Post()
  async createBadgeRule(@Body() body: CreateBadgeRuleDto) {
    const id = 'badgerule-' + crypto.randomUUID();
    const rule = await this.badgeRuleModel.create({
      _id: id,
      id,
      code: body.code,
      displayText: body.displayText,
      position: body.position,
      priority: body.priority,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      targetEcosystem: body.targetEcosystem || ['BAZARX'],
      conditionJson: body.conditionJson,
      isActive: body.isActive !== undefined ? body.isActive : true
    });
    return { success: true, data: rule };
  }

  @ApiOperation({ summary: 'Preview badge rule listing impact count' })
  @Post('preview')
  async previewBadgeRuleImpact(@Body() body: { conditionJson: any; targetEcosystem?: string[] }) {
    const { conditionJson, targetEcosystem } = body;
    
    const query = buildMongoQuery(conditionJson);
    query.status = 'ACTIVE';
    
    if (targetEcosystem && targetEcosystem.length > 0) {
      const ecoIds = targetEcosystem.filter(e => e !== 'BAZARX' && e !== 'GLOBAL');
      if (targetEcosystem.includes('BAZARX') || targetEcosystem.includes('GLOBAL')) {
        if (ecoIds.length > 0) {
          query.$or = [
            { ecosystemId: { $in: ecoIds } },
            { ecosystemId: { $exists: false } },
            { ecosystemId: null }
          ];
        }
      } else {
        query.ecosystemId = { $in: ecoIds };
      }
    }
    
    const count = await this.listingModel.countDocuments(query).exec();
    return { success: true, count };
  }

  @ApiOperation({ summary: 'Update an existing badge rule' })
  @Put(':id')
  async updateBadgeRule(@Param('id') id: string, @Body() body: UpdateBadgeRuleDto) {
    const rule = await this.badgeRuleModel.findOne({ id }).exec();
    if (!rule) {
      throw new NotFoundException('Kural bulunamadı');
    }

    const src = body as Record<string, unknown>;
    const upd: Record<string, unknown> = {};
    for (const key of ['code', 'displayText', 'position', 'priority', 'backgroundColor', 'textColor', 'targetEcosystem', 'conditionJson', 'isActive']) {
      if (src[key] !== undefined) upd[key] = src[key];
    }
    
    const updated = await this.badgeRuleModel.findOneAndUpdate(
      { id },
      { $set: upd },
      { new: true }
    ).lean().exec();
    
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: 'Delete a badge rule' })
  @Delete(':id')
  async deleteBadgeRule(@Param('id') id: string) {
    const res = await this.badgeRuleModel.deleteOne({ id }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('Kural bulunamadı');
    }
    return { success: true };
  }
}

interface BadgeConditionJson {
  AND?: BadgeConditionJson[]
  OR?: BadgeConditionJson[]
  field?: string
  operator?: string
  value?: unknown
}

function buildMongoQuery(condition: BadgeConditionJson): Record<string, unknown> {
  if (!condition) return {};

  // Logical operator (AND/OR)
  if (condition.AND && Array.isArray(condition.AND)) {
    return { $and: condition.AND.map((cond) => buildMongoQuery(cond)) };
  }
  if (condition.OR && Array.isArray(condition.OR)) {
    return { $or: condition.OR.map((cond) => buildMongoQuery(cond)) };
  }

  // Simple field-operator-value match
  const { field, operator, value } = condition;
  if (!field) return {};

  // Mapped value type conversions/handling
  let mappedValue = value;

  switch (operator) {
    case 'eq':
      return { [field]: mappedValue };
    case 'ne':
      return { [field]: { $ne: mappedValue } };
    case 'gt':
      return { [field]: { $gt: mappedValue } };
    case 'gte':
      return { [field]: { $gte: mappedValue } };
    case 'lt':
      return { [field]: { $lt: mappedValue } };
    case 'lte':
      return { [field]: { $lte: mappedValue } };
    case 'in':
      return { [field]: { $in: Array.isArray(mappedValue) ? mappedValue : [mappedValue] } };
    case 'nin':
      return { [field]: { $nin: Array.isArray(mappedValue) ? mappedValue : [mappedValue] } };
    case 'contains':
      return { [field]: { $regex: escapeRegExp(String(mappedValue ?? '')), $options: 'i' } };
    default:
      return { [field]: mappedValue };
  }
}
