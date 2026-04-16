"use strict";
// apps/backend/src/main.ts
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const path_1 = require("path");
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
    // Statik dosyalar (Uploads)
    app.useStaticAssets({
        root: (0, path_1.join)(process.cwd(), 'public/uploads'),
        prefix: '/uploads/',
    });
    // Global validation: whitelist, transform aktif
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    // Global Exception Filter: Tüm 500 hatalarını detaylı loglamak için
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    // Swagger Setup
    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
    const config = new DocumentBuilder()
        .setTitle('BazarX API')
        .setDescription('BarterBorsa - BazarX V2 Backend API Dokümantasyonu')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    const port = process.env.BACKEND_PORT || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`Backend ${port} portunda çalışmaya başladı.`);
}
bootstrap();
//# sourceMappingURL=main.js.map