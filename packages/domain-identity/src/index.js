"use strict";
// packages/domain-identity/src/index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Enums
__exportStar(require("./domain/enums/user-role.enum"), exports);
__exportStar(require("./domain/enums/user-status.enum"), exports);
__exportStar(require("./domain/enums/platform.enum"), exports);
// Entities
__exportStar(require("./domain/entities/user.entity"), exports);
__exportStar(require("./domain/entities/user-profile.entity"), exports);
__exportStar(require("./domain/entities/user-address.entity"), exports);
// Value Objects
__exportStar(require("./domain/value-objects/email.vo"), exports);
__exportStar(require("./domain/value-objects/phone-number.vo"), exports);
__exportStar(require("./domain/value-objects/password.vo"), exports);
__exportStar(require("./domain/value-objects/user-role.vo"), exports);
// Domain Events
__exportStar(require("./domain/events/user-registered.event"), exports);
__exportStar(require("./domain/events/user-updated.event"), exports);
__exportStar(require("./domain/events/user-deleted.event"), exports);
// Repository Interfaces
__exportStar(require("./domain/repositories/user.repository.interface"), exports);
__exportStar(require("./domain/repositories/user-profile.repository.interface"), exports);
__exportStar(require("./domain/repositories/user-address.repository.interface"), exports);
__exportStar(require("./domain/repositories/verification-token.repository.interface"), exports);
// DTOs
__exportStar(require("./application/dtos/register-user.dto"), exports);
__exportStar(require("./application/dtos/update-profile.dto"), exports);
__exportStar(require("./application/dtos/change-password.dto"), exports);
__exportStar(require("./application/dtos/add-address.dto"), exports);
__exportStar(require("./application/dtos/update-address.dto"), exports);
__exportStar(require("./application/dtos/user-response.dto"), exports);
__exportStar(require("./application/dtos/profile-response.dto"), exports);
__exportStar(require("./application/dtos/address-response.dto"), exports);
__exportStar(require("./application/dtos/forgot-password.dto"), exports);
__exportStar(require("./application/dtos/reset-password.dto"), exports);
// Commands
__exportStar(require("./application/commands/register-user.command"), exports);
__exportStar(require("./application/commands/register-user.handler"), exports);
__exportStar(require("./application/commands/login-user.command"), exports);
__exportStar(require("./application/commands/login-user.handler"), exports);
__exportStar(require("./application/commands/update-profile.command"), exports);
__exportStar(require("./application/commands/update-profile.handler"), exports);
__exportStar(require("./application/commands/change-password.command"), exports);
__exportStar(require("./application/commands/change-password.handler"), exports);
__exportStar(require("./application/commands/add-address.command"), exports);
__exportStar(require("./application/commands/add-address.handler"), exports);
__exportStar(require("./application/commands/update-address.command"), exports);
__exportStar(require("./application/commands/update-address.handler"), exports);
__exportStar(require("./application/commands/delete-address.command"), exports);
__exportStar(require("./application/commands/delete-address.handler"), exports);
__exportStar(require("./application/commands/set-transaction-pin.command"), exports);
__exportStar(require("./application/commands/set-transaction-pin.handler"), exports);
__exportStar(require("./application/commands/forgot-password.command"), exports);
__exportStar(require("./application/commands/forgot-password.handler"), exports);
__exportStar(require("./application/commands/reset-password.command"), exports);
__exportStar(require("./application/commands/reset-password.handler"), exports);
// Queries
__exportStar(require("./application/queries/get-user.query"), exports);
__exportStar(require("./application/queries/get-user.handler"), exports);
__exportStar(require("./application/queries/get-profile.query"), exports);
__exportStar(require("./application/queries/get-profile.handler"), exports);
__exportStar(require("./application/queries/list-users.query"), exports);
__exportStar(require("./application/queries/list-users.handler"), exports);
__exportStar(require("./application/queries/get-addresses.query"), exports);
__exportStar(require("./application/queries/get-addresses.handler"), exports);
__exportStar(require("./application/queries/get-login-history.query"), exports);
__exportStar(require("./application/queries/get-login-history.handler"), exports);
// Event Handlers
__exportStar(require("./application/event-handlers/user-registered.handler"), exports);
__exportStar(require("./application/event-handlers/user-updated.handler"), exports);
// Persistence (Infrastructure)
__exportStar(require("./infrastructure/persistence/prisma-user.repository"), exports);
__exportStar(require("./infrastructure/persistence/prisma-user-profile.repository"), exports);
__exportStar(require("./infrastructure/persistence/prisma-user-address.repository"), exports);
__exportStar(require("./infrastructure/persistence/prisma-verification-token.repository"), exports);
__exportStar(require("./infrastructure/persistence/mappers/user.mapper"), exports);
__exportStar(require("./infrastructure/persistence/mappers/user-profile.mapper"), exports);
__exportStar(require("./infrastructure/persistence/mappers/user-address.mapper"), exports);
// Auth & Events (Infrastructure)
__exportStar(require("./infrastructure/auth/local.strategy"), exports);
__exportStar(require("./infrastructure/auth/session.service"), exports);
__exportStar(require("./infrastructure/event-publishers/identity-event.publisher"), exports);
//# sourceMappingURL=index.js.map