import { Module, Logger } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule, PrismaService } from '@barterborsa/shared-persistence';
import { 
  SharedSecurityModule, 
  HashingService, 
  GoogleOAuthStrategy 
} from '@barterborsa/shared-security';
import { 
  PrismaUserRepository, 
  PrismaUserProfileRepository,
  PrismaUserAddressRepository,
  RegisterUserHandler,
  LoginUserHandler,
  UpdateProfileHandler,
  ChangePasswordHandler,
  AddAddressHandler,
  UpdateAddressHandler,
  DeleteAddressHandler,
  SetTransactionPinHandler,
  GetUserHandler,
  GetProfileHandler,
  ListUsersHandler,
  GetAddressesHandler,
  GetLoginHistoryHandler,
  UserRegisteredHandler,
  UserUpdatedHandler,
  SessionService,
  IdentityEventPublisher,
  LocalStrategy,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  PrismaVerificationTokenRepository
} from '@barterborsa/domain-identity';
import { ListAdminUsersHandler } from './application/queries/list-admin-users.handler';
import { UpdateUserStatusHandler } from './application/commands/update-user-status.handler';
import { UpdateUserRoleHandler } from './application/commands/update-user-role.handler';
import { DeleteAdminUserHandler } from './application/commands/delete-admin-user.handler';
import { AuthController } from './auth.controller';
import { GoogleOAuthController } from './google-oauth.controller';
import { ProfileController } from './profile.controller';
import { AddressController } from './address.controller';
import { UserController } from './user.controller';
import { AdminUserController } from './presentation/admin-user.controller';
import { AuthService } from './infrastructure/auth/auth.service';
import { TokenService } from './infrastructure/auth/token.service';
import { GoogleAuthGuard } from './infrastructure/auth/google-auth.guard';

const Handlers = [
  RegisterUserHandler,
  LoginUserHandler,
  UpdateProfileHandler,
  ChangePasswordHandler,
  AddAddressHandler,
  UpdateAddressHandler,
  DeleteAddressHandler,
  SetTransactionPinHandler,
  GetUserHandler,
  GetProfileHandler,
  ListUsersHandler,
  GetAddressesHandler,
  GetLoginHistoryHandler,
  UserRegisteredHandler,
  UserUpdatedHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler,
  ListAdminUsersHandler,
  UpdateUserStatusHandler,
  UpdateUserRoleHandler,
  DeleteAdminUserHandler,
];

@Module({
  imports: [
    CqrsModule,
    SharedSecurityModule,
    PrismaModule,
  ],
  controllers: [
    AuthController,
    GoogleOAuthController,
    ProfileController,
    AddressController,
    UserController,
    AdminUserController,
  ],
  providers: [
    AuthService,
    TokenService,
    GoogleAuthGuard,
    GoogleOAuthStrategy,
    SessionService,
    IdentityEventPublisher,
    LocalStrategy,
    ...Handlers,
    {
      provide: 'IUserRepository',
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IUserProfileRepository',
      useFactory: (prisma: PrismaService) => new PrismaUserProfileRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IUserAddressRepository',
      useFactory: (prisma: PrismaService) => new PrismaUserAddressRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IVerificationTokenRepository',
      useFactory: (prisma: PrismaService) => new PrismaVerificationTokenRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IEventBus',
      useFactory: () => ({
        publish: async (topic: string, data: any) => {
          const logger = new Logger('EventBusMock');
          if (process.env.NODE_ENV === 'production') {
            logger.error(`CRITICAL: EventBus mock called in production! Topic: ${topic}`);
            throw new Error(`EventBus mock is not allowed in production. Attempted to publish to: ${topic}`);
          }
          logger.log(`[Mock Publish] ${topic}: ${JSON.stringify(data)}`);
        }
      }),
    }
  ],
  exports: [AuthService, TokenService],
})
export class IdentityModule {}
