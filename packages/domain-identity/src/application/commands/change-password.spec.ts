// packages/domain-identity/src/application/commands/change-password.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordHandler } from './change-password.handler';
import { ChangePasswordCommand } from './change-password.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { HashingService } from '@barterborsa/shared-security';
import { Ok, Result } from '@barterborsa/shared-core';

describe('ChangePasswordHandler', () => {
  let handler: ChangePasswordHandler;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashingService: jest.Mocked<HashingService>;

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      findByEmail: jest.fn(),
      findByGoogleId: jest.fn(),
      count: jest.fn(),
    } as any;

    hashingService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordHandler,
        { provide: 'IUserRepository', useValue: userRepository },
        { provide: HashingService, useValue: hashingService },
      ],
    }).compile();

    handler = module.get<ChangePasswordHandler>(ChangePasswordHandler);
  });

  it('şifre başarıyla değiştirilmelidir', async () => {
    const userResult = User.create({
      email: 'test@example.com',
      passwordHash: 'hashed_old_password',
      role: 'USER',
      status: 'ACTIVE',
      platform: 'BAZARX',
      isEmailVerified: true,
    }, 'user-123');

    const user = (userResult as any).data; // Result tipinden User'ı al

    userRepository.findById.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(true);
    hashingService.hash.mockResolvedValue('hashed_new_password');

    const command = new ChangePasswordCommand('user-123', {
      currentPassword: 'OldPass123!',
      newPassword: 'NewPass123!'
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(hashingService.compare).toHaveBeenCalledWith('OldPass123!', 'hashed_old_password');
    expect(user.passwordHash).toBe('hashed_new_password');
    expect(userRepository.update).toHaveBeenCalledWith(user);
  });

  it('eski şifre yanlışsa hata döndürmelidir', async () => {
    const userResult = User.create({
      email: 'test@example.com',
      passwordHash: 'hashed_old_password',
      role: 'USER',
      status: 'ACTIVE',
      platform: 'BAZARX',
      isEmailVerified: true,
    }, 'user-123');

    const user = (userResult as any).data;

    userRepository.findById.mockResolvedValue(user);
    hashingService.compare.mockResolvedValue(false);

    const command = new ChangePasswordCommand('user-123', {
      currentPassword: 'WrongPass123!',
      newPassword: 'NewPass123!'
    });

    const result = await handler.execute(command);

    expect(result.success).toBe(false);
    expect((result as any).error?.message).toBe('Mevcut şifre hatalı. Lütfen kontrol edip tekrar deneyin.');
  });
});
