// apps/backend/src/modules/barter/domain/entities/surplus-item.entity.ts

import { AggregateRoot } from '@barterborsa/shared-core';
import { SurplusStatus } from '../enums/surplus-status.enum';
import { PilotCity } from '../enums/pilot-city.enum';
import { BadRequestException } from '@nestjs/common';

export interface SurplusItemProps {
  companyId:         string;
  title:             string;
  description?:      string;
  category:          string;
  materialType?:     string;
  quantity:          number;
  blockedQuantity:   number;
  unit:              string;
  minTradeQuantity?: number;
  unitPrice?:        number;
  wantedCategories?: unknown;
  tradeModes?:       unknown;
  technicalSpecs?:   unknown;
  images?:           unknown;
  location?:         string;
  city?:             PilotCity;
  status:            SurplusStatus;
  rejectionReason?:  string;
  approvedBy?:       string;
  reactivationCount: number;
  lastReactivatedAt?: Date;
  createdAt:         Date;
  updatedAt:         Date;
}

export class SurplusItem extends AggregateRoot<SurplusItemProps> {
  private constructor(props: SurplusItemProps, id?: string) {
    super(props, id);
  }

  // Persistence'dan yeniden oluşturmak için (domain doğrulaması atlanır)
  public static createFrom(props: SurplusItemProps, id: string): SurplusItem {
    return new SurplusItem(props, id);
  }

  public static create(
    companyId:        string,
    title:            string,
    category:         string,
    quantity:         number,
    unit:             string,
    city:             PilotCity,
    description?:     string,
    unitPrice?:       number,
    images?:          unknown,
    materialType?:    string,
    location?:        string,
    wantedCategories?: unknown,
    tradeModes?:      unknown,
    technicalSpecs?:  unknown,
  ): SurplusItem {
    if (quantity <= 0) {
      throw new BadRequestException('Miktar sıfırdan büyük olmalıdır');
    }
    const now = new Date();
    return new SurplusItem({
      companyId,
      title,
      description,
      category,
      materialType,
      quantity,
      blockedQuantity:   0,
      unit,
      unitPrice,
      city,
      images,
      location,
      wantedCategories,
      tradeModes,
      technicalSpecs,
      status:            SurplusStatus.PENDING_APPROVAL,
      reactivationCount: 0,
      createdAt:         now,
      updatedAt:         now,
    });
  }

  // Admin onayı: PENDING_APPROVAL → ACTIVE
  public approve(adminId: string): void {
    if (this.props.status !== SurplusStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Sadece onay bekleyen ilanlar onaylanabilir. Mevcut durum: ${this.props.status}`,
      );
    }
    this.props.status     = SurplusStatus.ACTIVE;
    this.props.approvedBy = adminId;
    this.props.updatedAt  = new Date();
  }

  // Admin reddi: PENDING_APPROVAL → REJECTED
  public reject(adminId: string, reason: string): void {
    if (this.props.status !== SurplusStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Sadece onay bekleyen ilanlar reddedilebilir. Mevcut durum: ${this.props.status}`,
      );
    }
    this.props.status          = SurplusStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.props.approvedBy      = adminId;
    this.props.updatedAt       = new Date();
  }

  // Vendor güncellemesi: her güncellemede tekrar onaya düşer
  public markUpdated(): void {
    this.props.status    = SurplusStatus.PENDING_APPROVAL;
    this.props.updatedAt = new Date();
  }

  // Vendor yeniden aktivasyonu: DEACTIVATED|EXPIRED|REJECTED → PENDING_APPROVAL
  public reactivate(newQuantity: number): void {
    const allowed: SurplusStatus[] = [
      SurplusStatus.DEACTIVATED,
      SurplusStatus.EXPIRED,
      SurplusStatus.REJECTED,
    ];
    if (!allowed.includes(this.props.status)) {
      throw new BadRequestException(
        `Sadece pasif ilanlar yeniden aktifleştirilebilir. Mevcut durum: ${this.props.status}`,
      );
    }
    if (newQuantity <= 0) {
      throw new BadRequestException('Miktar sıfırdan büyük olmalıdır');
    }
    this.props.quantity           = newQuantity;
    this.props.status             = SurplusStatus.PENDING_APPROVAL;
    this.props.reactivationCount += 1;
    this.props.lastReactivatedAt  = new Date();
    this.props.updatedAt          = new Date();
  }

  public blockQuantity(amount: number): void {
    const remaining = this.props.quantity - this.props.blockedQuantity;
    if (remaining < amount) {
      throw new BadRequestException('Yetersiz surplus miktarı');
    }
    this.props.blockedQuantity = this.props.blockedQuantity + amount;
  }

  public unblockQuantity(amount: number): void {
    this.props.blockedQuantity = this.props.blockedQuantity - amount;
  }

  // Getter'lar
  get status():             SurplusStatus { return this.props.status; }
  get companyId():          string        { return this.props.companyId; }
  get reactivationCount():  number        { return this.props.reactivationCount; }
}