import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { profile: true, vendor: true }
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { profile: true, vendor: true }
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { googleId, deletedAt: null },
      include: { profile: true, vendor: true }
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: { phoneNumber, deletedAt: null },
      include: { profile: true, vendor: true }
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
    const { id, ...updateData } = data;

    try {
      // 1. User'ı upsert et (nested profile olmadan — güvenli yol)
      await this.prisma.user.upsert({
        where: { id },
        create: data,
        update: updateData,
      });

      // 2. Profile'ı ayrı upsert et (bağımsız kontrol)
      await this.prisma.userProfile.upsert({
        where: { userId: user.id },
        create: { ...profileData, userId: user.id },
        update: profileData,
      });

      this.logger.debug(`User saved: ${user.email}`);
    } catch (err: any) {
      this.logger.error(`Failed to save user ${user.email}: ${err.message}`, err.stack);
      throw err; // Hatayı yutma — üst katmana fırlat
    }
  }

  async update(user: User): Promise<void> {
    await this.save(user);
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
      include: { profile: true, vendor: true }
    });
    
    return records.map((r: any) => UserMapper.toDomain(r));
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
