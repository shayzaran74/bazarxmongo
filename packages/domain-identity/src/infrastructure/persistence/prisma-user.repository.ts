// packages/domain-identity/src/infrastructure/persistence/prisma-user.repository.ts

import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Optional } from '@barterborsa/shared-core';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Optional<User>> {
    const record = await (this.prisma as any).user.findUnique({
      where: { id },
      include: { profile: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<User[]> {
    const records = await (this.prisma as any).user.findMany({
      include: { profile: true },
    });
    return records.map((record: any) => this.toDomain(record));
  }

  async findByEmail(email: string): Promise<Optional<User>> {
    const record = await (this.prisma as any).user.findUnique({
      where: { email },
      include: { profile: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async exists(email: string): Promise<boolean> {
    const count = await (this.prisma as any).user.count({
      where: { email },
    });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const data = this.toPersistence(user);
    const { firstName, lastName, ...userData } = data;

    await (this.prisma as any).$transaction(async (tx: any) => {
      // 1. Ana kullanıcı tablosunu güncelle/oluştur
      await tx.user.upsert({
        where: { id: user.id },
        update: userData,
        create: userData,
      });

      // 2. Profil tablosunu güncelle/oluştur
      if (firstName || lastName) {
        await tx.userProfile.upsert({
          where: { userId: user.id },
          update: { firstName, lastName },
          create: { userId: user.id, firstName, lastName },
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).user.delete({
      where: { id },
    });
  }

  protected toDomain(record: any): User {
    const userResult = User.create({
      email: record.email,
      phoneNumber: record.phoneNumber,
      passwordHash: record.password, // DB'deki 'password' alanı entity'de 'passwordHash'
      role: record.role as any,
      status: record.status as any,
      platform: record.platform as any,
      isEmailVerified: record.isEmailVerified,
      googleId: record.googleId,
      firstName: record.profile?.firstName,
      lastName: record.profile?.lastName,
      lastLoginAt: record.lastLoginAt,
      lastSeenAt: record.lastSeenAt,
    }, record.id);

    if (!userResult.success) {
      throw userResult.error;
    }

    return userResult.data;
  }

  protected toPersistence(user: User): any {
    const props = (user as any).props;
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: props.passwordHash, // Şemada 'password' olarak tanımlı
      role: user.role,
      status: user.status,
      platform: user.platform,
      isEmailVerified: props.isEmailVerified,
      googleId: props.googleId,
      lastLoginAt: props.lastLoginAt,
      firstName: user.firstName, // Mapper tarafından UserProfile'a ayrıştırılacak
      lastName: user.lastName,   // Mapper tarafından UserProfile'a ayrıştırılacak
    };
  }
}
