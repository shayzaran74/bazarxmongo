"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UserUpdatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const user_updated_event_1 = require("../../domain/events/user-updated.event");
const common_1 = require("@nestjs/common");
let UserUpdatedHandler = UserUpdatedHandler_1 = class UserUpdatedHandler {
    eventBus;
    logger = new common_1.Logger(UserUpdatedHandler_1.name);
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async handle(event) {
        this.logger.log(`User updated: ${event.userId}`);
        try {
            await this.eventBus.publish('user.updated', {
                userId: event.userId,
                changedFields: event.changedFields
            });
        }
        catch (error) {
            this.logger.error(`Failed to publish UserUpdated integration event: ${error.message}`);
        }
    }
};
exports.UserUpdatedHandler = UserUpdatedHandler;
exports.UserUpdatedHandler = UserUpdatedHandler = UserUpdatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(user_updated_event_1.UserUpdatedEvent),
    __param(0, (0, common_1.Inject)('IEventBus')),
    __metadata("design:paramtypes", [Object])
], UserUpdatedHandler);
//# sourceMappingURL=user-updated.handler.js.map