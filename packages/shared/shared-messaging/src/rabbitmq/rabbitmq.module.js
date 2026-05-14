"use strict";
// packages/shared/shared-messaging/src/rabbitmq/rabbitmq.module.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const config_1 = require("@nestjs/config");
const rabbitmq_service_1 = require("./rabbitmq.service");
let RabbitMQModule = class RabbitMQModule {
};
exports.RabbitMQModule = RabbitMQModule;
exports.RabbitMQModule = RabbitMQModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            nestjs_rabbitmq_1.RabbitMQModule.forRootAsync({
                useFactory: (config) => ({
                    uri: config.get('RABBITMQ_URL') || config.get('RABBITMQ_URI') || 'amqp://localhost:5672',
                    exchanges: [
                        { name: 'identity.events', type: 'topic' },
                        { name: 'commerce.events', type: 'topic' },
                        { name: 'financial.events', type: 'topic' },
                        { name: 'delivery.events', type: 'topic' },
                        { name: 'barter.events', type: 'topic' },
                        { name: 'auction.events', type: 'topic' },
                        { name: 'order.events', type: 'topic' },
                        { name: 'inventory.events', type: 'topic' },
                        // İşlenemez mesajların yönlendirildiği dead-letter exchange'leri
                        { name: 'financial.dead-letter', type: 'topic' },
                    ],
                    connectionInitOptions: { wait: true },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [rabbitmq_service_1.RabbitMQService],
        exports: [nestjs_rabbitmq_1.RabbitMQModule, rabbitmq_service_1.RabbitMQService],
    })
], RabbitMQModule);
//# sourceMappingURL=rabbitmq.module.js.map