// packages/domain-identity/src/infrastructure/persistence/prisma-user.repository.ts

import { PrismaService, BasePrismaRepository } from '@barterborsa/shared-persistence';
import { User, UserProps } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User as PrismaUserModel } from '@prisma/client';
import { Optional } from '@barterborsa/shared-core';

export class PrismaUserRepository 
  extends BasePrismaRepository<User, PrismaUserModel> 
  implements IUserRepository 
{
  constructor(protected override readonly prisma: PrismaService) {
    super(prisma, 'user');
  }

  // BasePrismaRepository ile uyumlu dönüş tipi: User | null
  async findById(id: string): Promise<User | null> {
    const record = await (this.prisma as any).user.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<Optional<User>> {
    const record = await (this.prisma as any).user.findUnique({
      where: { email },
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
    console.log('[REPO] Saving user data:', data);
    await (this.prisma as any).user.upsert({
      where: { id: user.id },
      update: data,
      create: data,
    });
  }

  protected toDomain(record: PrismaUserModel): User {
    const userResult = User.create({
      email: record.email,
      passwordHash: record.passwordHash,
      firstName: (record as any).firstName || undefined,
      lastName: (record as any).lastName || undefined,
      role: record.role as any,
      status: record.status as any,
      isEmailVerified: record.isEmailVerified,
    }, record.id);

    if (!userResult.success) {
      throw userResult.error;
    }

    return userResult.data;
  }

  protected toPersistence(entity: User): any {
    const props = (entity as any).props as UserProps;
    return {
      id: entity.id,
      email: props.email,
      passwordHash: props.passwordHash,
      firstName: props.firstName,
      lastName: props.lastName,
      role: props.role,
      status: props.status,
      isEmailVerified: props.isEmailVerified,
      version: entity.version,
    };
  }
}
