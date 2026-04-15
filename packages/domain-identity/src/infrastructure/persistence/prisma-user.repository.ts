import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserMapper } from './mappers/user.mapper';
import { Optional } from '@barterborsa/shared-core';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { profile: true }
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { profile: true }
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { googleId, deletedAt: null },
      include: { profile: true }
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { phoneNumber, deletedAt: null },
      include: { profile: true }
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email, deletedAt: null }
    });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    const profileData = UserMapper.toProfilePersistence(user);
    
    await this.prisma.$transaction([
      this.prisma.user.create({ data }),
      this.prisma.userProfile.create({ data: profileData })
    ]);
  }

  async update(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    const { id, ...updateData } = data;
    await this.prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async findMany(pagination: any, filters?: any): Promise<User[]> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    
    const records = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(filters?.role && { role: filters.role }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { email: { contains: filters.search, mode: 'insensitive' } },
            { phoneNumber: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { profile: true }
    });
    
    return records.map(r => UserMapper.toDomain(r));
  }

  async count(filters?: any): Promise<number> {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        ...(filters?.role && { role: filters.role }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { email: { contains: filters.search, mode: 'insensitive' } },
            { phoneNumber: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      }
    });
  }
}
