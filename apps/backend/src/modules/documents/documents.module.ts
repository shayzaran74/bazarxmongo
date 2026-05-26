// apps/backend/src/modules/documents/documents.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorDocumentSchema } from './infrastructure/persistence/schemas/vendor-document.schema';
import { MongoVendorDocumentRepository } from './infrastructure/persistence/mongo-vendor-document.repository';
import { DocumentService } from './application/services/document.service';
import { VendorDocumentController } from './presentation/vendor-document.controller';
import { VendorDocumentAdminController } from './presentation/vendor-document-admin.controller';
import { MediaModule } from '../media/media.module';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'VendorDocument', schema: VendorDocumentSchema }
    ]),
    MediaModule,
    VendorModule,
  ],
  controllers: [VendorDocumentController, VendorDocumentAdminController],
  providers: [
    DocumentService,
    MongoVendorDocumentRepository,
    {
      provide: 'IVendorDocumentRepository',
      useClass: MongoVendorDocumentRepository,
    },
  ],
  exports: [DocumentService, 'IVendorDocumentRepository'],
})
export class DocumentsModule {}
