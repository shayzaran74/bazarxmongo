// apps/backend/src/modules/identity/identity.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '@barterborsa/shared-persistence';
import { 
  SharedSecurityModule, 
  HashingService, 
  GoogleOAuthStrategy 
} from '@barterborsa/shared-security';
import { 
  PrismaUserRepository, 
  RegisterUserUseCase, 
  LoginUserUseCase,
  IUserRepository
} from '@barterborsa/domain-identity';
import { AuthController } from './auth.controller';
import { GoogleOAuthController } from './google-oauth.controller';
import { AuthService } from './infrastructure/auth/auth.service';
import { TokenService } from './infrastructure/auth/token.service';
import { GoogleAuthGuard } from './infrastructure/auth/google-auth.guard';

@Module({
  imports: [
    SharedSecurityModule,
    PrismaModule,
  ],
  controllers: [
    AuthController,
    GoogleOAuthController,
  ],
  providers: [
    AuthService,
    TokenService,
    GoogleAuthGuard,
    GoogleOAuthStrategy,
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
  exports: [AuthService, TokenService, RegisterUserUseCase],
})
export class IdentityModule {
  constructor(private readonly googleStrategy: GoogleOAuthStrategy) {
    // Strateji başlatıldı.
  }
}
