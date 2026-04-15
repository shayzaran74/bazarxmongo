import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChangePasswordCommand } from './change-password.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result, Ok, Err, DomainException, NotFoundException } from '@barterborsa/shared-core';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand, Result<void>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly hashingService: HashingService
  ) {}

  async execute(command: ChangePasswordCommand): Promise<Result<void>> {
    const { userId, dto } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Err(new NotFoundException('Kullanıcı bulunamadı.'));
    }

    if (user.passwordHash) {
      const isValid = await this.hashingService.compare(dto.currentPassword, user.passwordHash);
      if (!isValid) {
        return Err(new DomainException('Mevcut şifre hatalı.'));
      }
    }

    const newHash = await this.hashingService.hash(dto.newPassword);
    // Update password hash logic
    (user as any).props.passwordHash = newHash;

    await this.userRepository.update(user);

    return Ok(undefined);
  }
}
