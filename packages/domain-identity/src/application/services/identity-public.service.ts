// packages/domain-identity/src/application/services/identity-public.service.ts
// Kimlik modülü dışındaki modüllerin kullanıcı verilerine güvenli erişim noktası.
// Diğer modüller @InjectModel('User') yerine bu servisi enjekte etmelidir.

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

export interface UserMinimalDto {
  id: string;
  email: string;
  role: string;
  status: string;
}

@Injectable()
export class IdentityPublicService {
  private readonly logger = new Logger(IdentityPublicService.name);

  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async getUserById(id: string): Promise<UserMinimalDto | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role, status: user.status };
  }

  // Sistem satıcısı gibi admin gerektiren bootstrap işlemleri için kullanılır.
  async findFirstAdmin(): Promise<UserMinimalDto | null> {
    const user = await this.userRepository.findFirstByRole(['ADMIN', 'SUPER_ADMIN']);
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role, status: user.status };
  }

  async updateUserRole(
    userId: string,
    role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN',
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`Kullanıcı bulunamadı: ${userId}`);
    user.updateRole(role);
    await this.userRepository.update(user);
    this.logger.debug(`Kullanıcı rolü güncellendi: ${userId} → ${role}`);
  }

  async suspendUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`Kullanıcı bulunamadı: ${userId}`);
    user.suspend();
    await this.userRepository.update(user);
    this.logger.debug(`Kullanıcı askıya alındı: ${userId}`);
  }

  async activateUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(`Kullanıcı bulunamadı: ${userId}`);
    user.activate();
    await this.userRepository.update(user);
    this.logger.debug(`Kullanıcı aktifleştirildi: ${userId}`);
  }
}
