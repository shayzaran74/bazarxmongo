import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HashingService } from '@barterborsa/shared-security';
import { Result, Ok, Err, DomainException, IEventBus } from '@barterborsa/shared-core';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '../../domain/entities/user.entity';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, Result<UserResponseDto>> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly hashingService: HashingService,
    @Inject('IEventBus') private readonly eventBus: IEventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<Result<UserResponseDto>> {
    const { email, password, phoneNumber, platform, referralCode } = command.dto;

    const exists = await this.userRepository.exists(email);
    if (exists) {
      return Err(new DomainException('Bu e-posta adresi zaten kullanımda.'));
    }

    const passwordHash = await this.hashingService.hash(password);

    const userResult = User.create({
      email,
      passwordHash,
      firstName: command.dto.firstName,
      lastName: command.dto.lastName,
      phoneNumber,
      platform: (platform as any) || 'BAZARX',
      role: 'USER',
      status: 'ACTIVE',
      isEmailVerified: false,
    });

    if (!userResult.success) {
      return Err(new DomainException('Kullanıcı oluşturulamadı.'));
    }

    const user = userResult.data;
    await this.userRepository.save(user);

    // RabbitMQ Publish user.registered
    this.eventBus.publish('user.registered', {
      userId: user.id,
      email: user.email,
      role: user.role,
      platform: user.platform
    });

    return Ok(UserResponseDto.fromEntity(user));
  }
}
