// apps/backend/src/modules/commerce/infrastructure/persistence/prisma-dispute.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Dispute } from '@prisma/client';
import { IDisputeRepository } from '../../domain/repositories/dispute.repository.interface';

@Injectable()
export class PrismaDisputeRepository implements IDisputeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(data: Partial<Dispute>): Promise<Dispute> {
    if (data.id) {
      return this.prisma.dispute.upsert({
        where: { id: data.id },
        update: {
          status: data.status,
          adminNote: data.adminNote,
          resolutionType: data.resolutionType,
          resolvedAt: data.resolvedAt,
          evidenceUrls: data.evidenceUrls,
        },
        create: {
          orderId: data.orderId!,
          userId: data.userId!,
          vendorId: data.vendorId!,
          reason: data.reason!,
          description: data.description,
          status: data.status || 'OPEN',
          evidenceUrls: data.evidenceUrls || [],
        },
      });
    }

    return this.prisma.dispute.create({
      data: {
        orderId: data.orderId!,
        userId: data.userId!,
        vendorId: data.vendorId!,
        reason: data.reason!,
        description: data.description,
        status: data.status || 'OPEN',
        evidenceUrls: data.evidenceUrls || [],
      },
    });
  }

  async findById(id: string): Promise<Dispute | null> {
    return this.prisma.dispute.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  async findByOrderId(orderId: string): Promise<Dispute | null> {
    return this.prisma.dispute.findUnique({
      where: { orderId },
    });
  }

  async list(filters: { status?: any; vendorId?: string; userId?: string }): Promise<Dispute[]> {
    return this.prisma.dispute.findMany({
      where: filters,
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
