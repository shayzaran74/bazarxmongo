// apps/backend/src/modules/identity/identity.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '@barterborsa/shared-persistence';
import { HashingService } from '@barterborsa/shared-security';
import { 
  PrismaUserRepository, 
  RegisterUserUseCase, 
  LoginUserUseCase,
  IUserRepository
} from '@barterborsa/domain-identity';
import { AuthController } from './auth.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    HashingService,
    {
      provide: 'IUserRepository',
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: RegisterUserUseCase,
      useFactory: (repo: IUserRepository, hash: HashingService) => new RegisterUserUseCase(repo, hash),
      inject: ['IUserRepository', HashingService],
    },
    {
      provide: LoginUserUseCase,
      useFactory: (repo: IUserRepository, hash: HashingService) => new LoginUserUseCase(repo, hash),
      inject: ['IUserRepository', HashingService],
    },
  ],
  exports: [RegisterUserUseCase, LoginUserUseCase],
})
export class IdentityModule {}
