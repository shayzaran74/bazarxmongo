// packages/domain-identity/src/infrastructure/persistence/prisma-user.repository.ts

import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Optional } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Optional<User>> {
    const record = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      include: { profile: true },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findByEmail(email: string): Promise<Optional<User>> {
    const record = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    return record ? this.toDomain(record) : null;
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const data = this.toPersistence(user);
    const { firstName, lastName, ...userData } = data;

    await this.prisma.$transaction(async (tx) => {
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
    await this.prisma.user.delete({
      where: { id },
    });
  }

  protected toDomain(record: unknown): User {
    // Record tipini açıkça tanımlayarak Prisma namespace hatalarını önlüyoruz
    const userRecord = record as {
      id: string;
      email: string;
      phoneNumber: string | null;
      password: string | null;
      role: User['role'];
      status: User['status'];
      platform: User['platform'];
      isEmailVerified: boolean;
      googleId: string | null;
      lastLoginAt: Date | null;
      lastSeenAt: Date | null;
      profile?: { firstName: string | null; lastName: string | null } | null;
    };
    
    const userResult = User.create({
      email: userRecord.email,
      phoneNumber: userRecord.phoneNumber || undefined,
      passwordHash: userRecord.password || undefined, 
      role: userRecord.role,
      status: userRecord.status,
      platform: userRecord.platform,
      isEmailVerified: userRecord.isEmailVerified,
      googleId: userRecord.googleId || undefined,
      firstName: userRecord.profile?.firstName || undefined,
      lastName: userRecord.profile?.lastName || undefined,
      lastLoginAt: userRecord.lastLoginAt || undefined,
      lastSeenAt: userRecord.lastSeenAt || undefined,
    }, userRecord.id);

    if (!userResult.success) {
      throw userResult.error;
    }

    return userResult.data;
  }

  protected toPersistence(user: User): Prisma.UserCreateInput & { firstName?: string; lastName?: string } {
    const props = (user as unknown as { props: Record<string, unknown> }).props;
    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: props.passwordHash as string | undefined,
      role: user.role as Prisma.UserCreateInput['role'],
      status: user.status as Prisma.UserCreateInput['status'],
      platform: user.platform as Prisma.UserCreateInput['platform'],
      isEmailVerified: props.isEmailVerified as boolean,
      googleId: props.googleId as string | undefined,
      lastLoginAt: props.lastLoginAt as Date | undefined,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
