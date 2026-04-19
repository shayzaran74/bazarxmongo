
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function listRoutes() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const router = server._events.request._router;

  const availableRoutes: string[] = router.stack
    .filter((r: any) => r.route)
    .map((r: any) => {
      return `${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`;
    });

  console.log('Available Routes:');
  availableRoutes.forEach(route => console.log(route));
  await app.close();
}

listRoutes();
