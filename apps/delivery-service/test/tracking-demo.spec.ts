import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// .env dosyasını yükle
dotenv.config({ path: resolve(__dirname, '../.env') });

import { AppModule } from '../src/app.module';
import { CommandBus } from '@nestjs/cqrs';
import { CreateShipmentCommand } from '../src/modules/shipment/application/commands/create-shipment.command';
import { UpdateLocationCommand } from '../src/modules/tracking/application/commands/update-location.command';
import { FastifyAdapter } from '@nestjs/platform-fastify';

describe('Tracking WebSocket Demo', () => {
  let app: INestApplication;
  let commandBus: CommandBus;
  const logger = new Logger('TrackingDemo');

  beforeAll(async () => {
    logger.log(`Bağlanılacak URI: ${process.env.MONGODB_URI}`);
    
    // Uygulama ayağa kalkarken timeout'u artırıyoruz
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication(new FastifyAdapter());
    commandBus = app.get(CommandBus);
    await app.init();
  }, 30000); // 30 saniye timeout

  afterAll(async () => {
    await app.close();
  });

  it('Sipariş oluşturmalı ve canlı konum güncellemeli', async () => {
    logger.log('--- DEMO BAŞLIYOR ---');

    // 1. Kargo Oluştur
    const shipmentResult = await commandBus.execute(new CreateShipmentCommand({
      orderId: 'DEMO-ORDER-123',
      senderId: 'VENDOR-A',
      receiverId: 'USER-B',
      vendorId: 'VENDOR-A',
      type: 'ORDER',
      senderAddress: {
        fullName: 'Satıcı Ali',
        phone: '5551234567',
        addressLine1: 'İstanbul Depo',
        city: 'İstanbul',
        district: 'Ataşehir'
      },
      receiverAddress: {
        fullName: 'Alıcı Veli',
        phone: '5559876543',
        addressLine1: 'Ankara Ev',
        city: 'Ankara',
        district: 'Çankaya'
      }
    }));

    const shipmentId = shipmentResult.data;
    logger.log(`Kargo Oluşturuldu: ID = ${shipmentId}`);

    // 2. Konum Güncelleme (WebSocket Broadcast Tetikler)
    logger.log('Konum güncelleniyor (37.77, -122.41)...');
    await commandBus.execute(new UpdateLocationCommand(
      shipmentId,
      37.7749, // latitude
      -122.4194, // longitude
      45, // speed
      180 // heading
    ));

    logger.log('Konum güncellendi! WebSocket üzerinden "locationUpdate" eventi tüm abonelere yayınlandı.');
    logger.log('--- DEMO TAMAMLANDI ---');
  });
});
