// apps/backend/src/modules/identity/identity.module.ts
// IdentityModule — Mongoose migration (ADR-005 Faz 2c)

import { Module, Logger } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule, RabbitMQService } from '@barterborsa/shared-messaging';
import {
  SharedSecurityModule,
  GoogleOAuthStrategy,
} from '@barterborsa/shared-security';
import {
  MongoUserRepository,
  MongoUserProfileRepository,
  MongoUserAddressRepository,
  MongoVerificationTokenRepository,
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
} from '@barterborsa/domain-identity';
import {
  User, UserSchema,
  UserProfile, UserProfileSchema,
  UserAddress, UserAddressSchema,
  VerificationToken, VerificationTokenSchema,
  Session, SessionSchema,
  UserLevel, UserLevelSchema,
  UserSubscription, UserSubscriptionSchema,
  ReferralSchema,
  XpTransactionSchema,
  OrderSchema,
  Vendor, VendorSchema,
  Company, CompanySchema,
  MembershipTierSchema,
} from '@barterborsa/shared-persistence';

import { ListAdminUsersHandler } from './application/queries/list-admin-users.handler';
import { UpdateUserStatusHandler } from './application/commands/update-user-status.handler';
import { UpdateUserRoleHandler } from './application/commands/update-user-role.handler';
import { DeleteAdminUserHandler } from './application/commands/delete-admin-user.handler';
import { GrantReferralRewardHandler } from './application/commands/grant-referral-reward.handler';
import { ReferralService } from './application/services/referral.service';
import { CommunicationModule } from '../communication/communication.module';
import { AuditMongooseModule } from '../audit/audit-mongoose.module';

import { AuthController } from './auth.controller';
import { GoogleOAuthController } from './google-oauth.controller';
import { ProfileController } from './profile.controller';
import { AddressController } from './address.controller';
import { UserController } from './user.controller';
import { AdminUserController } from './presentation/admin-user.controller';

import { AuthService } from './infrastructure/auth/auth.service';
import { TokenService } from './infrastructure/auth/token.service';
import { GoogleAuthGuard } from './infrastructure/auth/google-auth.guard';
import { MongoReferralRepository } from './infrastructure/persistence/mongo-referral.repository';

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
  GrantReferralRewardHandler,
];

@Module({
  imports: [
    CqrsModule,
    SharedSecurityModule,
    MongooseModule.forFeature([
      { name: 'User',                 schema: UserSchema },
      { name: 'UserProfile',          schema: UserProfileSchema },
      { name: 'UserAddress',          schema: UserAddressSchema },
      { name: 'VerificationToken',    schema: VerificationTokenSchema },
      { name: 'Session',              schema: SessionSchema },
      { name: 'UserLevel',            schema: UserLevelSchema },
      { name: 'UserSubscription',     schema: UserSubscriptionSchema },
      { name: 'Referral',             schema: ReferralSchema },
      { name: 'XpTransaction',        schema: XpTransactionSchema },
      { name: 'Order',                schema: OrderSchema },
      { name: 'Vendor',               schema: VendorSchema },
      { name: 'Company',              schema: CompanySchema },
      { name: 'MembershipTier',       schema: MembershipTierSchema },
    ]),
    RabbitMQModule,
    CommunicationModule,
    AuditMongooseModule,
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
    ReferralService,
    LocalStrategy,
    ...Handlers,
    {
      provide: 'IUserRepository',
      useClass: MongoUserRepository,
    },
    {
      provide: 'IUserProfileRepository',
      useClass: MongoUserProfileRepository,
    },
    {
      provide: 'IUserAddressRepository',
      useClass: MongoUserAddressRepository,
    },
    {
      provide: 'IVerificationTokenRepository',
      useClass: MongoVerificationTokenRepository,
    },
    {
      provide: 'IReferralRepository',
      useClass: MongoReferralRepository,
    },
    {
      provide: 'IEventBus',
      useFactory: (rabbitMQ: RabbitMQService) => ({
        publish: async (topic: string, data: any) => {
          const logger = new Logger('IdentityEventBus');
          try {
            await rabbitMQ.publish('identity.events', topic, data);
          } catch (err: unknown) {
            logger.error(`Event publish failed [${topic}]: ${(err instanceof Error ? err.message : String(err))}`);
          }
        },
      }),
      inject: [RabbitMQService],
    },
  ],
  exports: [AuthService, TokenService],
})
export class IdentityModule {}