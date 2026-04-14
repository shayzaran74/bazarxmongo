"use strict";
// apps/backend/src/main.ts
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    // CORS: Frontend'in backend ile konuşabilmesi için şart
    app.enableCors({
        origin: true,
        credentials: true,
    });
    // Global prefix: /api/v1
    app.setGlobalPrefix('api/v1');
    // Global validation: whitelist, transform aktif
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const port = process.env.BACKEND_PORT || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`Backend ${port} portunda çalışmaya başladı.`);
}
bootstrap();
//# sourceMappingURL=main.js.map