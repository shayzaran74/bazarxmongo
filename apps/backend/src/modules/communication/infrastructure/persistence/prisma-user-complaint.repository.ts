// apps/backend/src/modules/communication/infrastructure/persistence/prisma-user-complaint.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IUserComplaintRepository } from '../../domain/repositories/user-complaint.repository.interface';
import { UserComplaint } from '../../domain/entities/user-complaint.entity';
import { UserComplaintMapper } from './mappers/user-complaint.mapper';

@Injectable()
export class PrismaUserComplaintRepository implements IUserComplaintRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserComplaintMapper
  ) {}

  async findById(id: string): Promise<UserComplaint | null> {
    const raw = await this.prisma.userComplaint.findUnique({ where: { id } });
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(options?: { status?: string }): Promise<UserComplaint[]> {
    const raws = await this.prisma.userComplaint.findMany({
      where: {
        ...(options?.status ? { status: options.status as any } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async findByReporterId(userId: string): Promise<UserComplaint[]> {
    const raws = await this.prisma.userComplaint.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' }
    });
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(complaint: UserComplaint): Promise<void> {
    const data = this.mapper.toPersistence(complaint);
    await this.prisma.userComplaint.upsert({
      where: { id: complaint.id },
      update: data,
      create: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userComplaint.delete({ where: { id } });
  }
}
