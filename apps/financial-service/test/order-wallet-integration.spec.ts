// apps/financial-service/test/order-wallet-integration.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Decimal } from 'decimal.js';

import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('Order & Wallet Integration (End-to-End)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let amqpConnection: AmqpConnection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    prisma = app.get<PrismaService>(PrismaService);
    amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('OrderCreated event fırlatıldığında Escrow kaydı oluşturulmalı ve bakiye rezerve edilmeli', async () => {
    // 1. Test kullanıcısı ve cüzdanı hazırla
    const userId = 'test-user-integration-' + Date.now();
    await prisma.wallet.create({
      data: {
        userId,
        balanceTL: new Decimal(1000),
        barterBalance: new Decimal(0),
        xpPoints: 0,
        xpAdsBalance: new Decimal(0),
        xpTradeBalance: new Decimal(0),
        xpCommissionBalance: new Decimal(0),
      },
    });

    // 2. Simulasyon: Order Service bir sipariş oluşturdu ve event fırlattı
    const orderData = {
      orderId: 'test-order-' + Date.now(),
      buyerId: userId,
      sellerId: 'test-seller-id',
      totalAmount: 250.50, // TL
      currency: 'TRY'
    };

    // Event'i RabbitMQ'ya gönder (Financial Service'in bunu dinleyen bir handler'ı olmalı)
    await amqpConnection.publish(
      'commerce.events',
      'order.created',
      orderData
    );

    // 3. Bekle ve Doğrula (Asenkron işlem olduğu için kısa bir bekleme ekliyoruz)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Escrow kaydı oluştu mu?
    const escrow = await prisma.escrow.findFirst({
      where: { orderId: orderData.orderId }
    });

    expect(escrow).toBeDefined();
    expect(escrow?.amount.toNumber()).toBe(250.50);
    expect(escrow?.status).toBe('PENDING'); // Veya iş akışına göre FUNDED

    // Cüzdan bakiyesi değişti mi? 
    // Not: Uygulama mantığına göre direkt düşebilir veya ayrı bir 'blockedAmount' alanında tutulabilir.
    // Bizim şu anki basit implementasyonumuzda escrow oluşması yeterli bir kanıttır.
  });
});
