import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SetTransactionPinCommand } from './set-transaction-pin.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { EncryptionService } from '@barterborsa/shared-security';
import { Result, Ok, Err, NotFoundException } from '@barterborsa/shared-core';

@CommandHandler(SetTransactionPinCommand)
export class SetTransactionPinHandler implements ICommandHandler<SetTransactionPinCommand, Result<void>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly encryptionService: EncryptionService
  ) {}

  async execute(command: SetTransactionPinCommand): Promise<Result<void>> {
    const { userId, pin } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return Err(new NotFoundException('Kullanıcı bulunamadı.'));
    }

    // Encrypt pin
    const encryptedPin = this.encryptionService.encrypt(pin);
    
    // User props update
    (user as any).props.transactionPin = encryptedPin;

    await this.userRepository.update(user);

    return Ok(undefined);
  }
}
