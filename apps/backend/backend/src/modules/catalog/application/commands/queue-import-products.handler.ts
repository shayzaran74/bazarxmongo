// apps/backend/src/modules/catalog/application/commands/queue-import-products.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BadRequestException, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PRODUCT_IMPORT_QUEUE } from '@barterborsa/shared-queue';
import { ProductImportJobData } from '../workers/product-import.worker';
import { QueueImportProductsCommand, ImportProductRow } from './queue-import-products.command';
import { ImportJob } from '@barterborsa/shared-persistence/schemas/backend/importJob.schema';

const MAX_ROWS = 50_000;

@CommandHandler(QueueImportProductsCommand)
export class QueueImportProductsHandler implements ICommandHandler<QueueImportProductsCommand> {
  private readonly logger = new Logger(QueueImportProductsHandler.name);

  constructor(
    @InjectQueue('product-import') private readonly importQueue: Queue,
  ) {}

  async execute(command: QueueImportProductsCommand) {
    const { rows, adminId } = command;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('En az 1 satır gereklidir');
    }
    if (rows.length > MAX_ROWS) {
      throw new BadRequestException(
        `Maksimum ${MAX_ROWS.toLocaleString('tr-TR')} satır yüklenebilir (gönderilen: ${rows.length})`,
      );
    }

    const typedRows = rows as ImportProductRow[];
    const emptyNameCount = typedRows.filter(r => !r.name && !r.title).length;
    if (emptyNameCount === rows.length) {
      throw new BadRequestException('Hiçbir satırda ürün adı bulunamadı');
    }

    const id = 'import-' + crypto.randomUUID();
    const importJob = new ImportJob({
      id,
      adminId,
      status: 'PENDING',
      totalRows: rows.length,
      processedRows: 0,
      createdRows: 0,
      failedRows: 0,
    });
    await importJob.save();

    const jobData: ProductImportJobData = {
      jobId: importJob.id,
      adminId,
      rows: typedRows as Record<string, unknown>[],
      vendorType: command.vendorType,
    };

    await this.importQueue.add(
      'import-products',
      jobData,
      { jobId: importJob.id, priority: 10 },
    );

    this.logger.log(`Import job kuyruğa eklendi: ${importJob.id} — ${rows.length} satır, admin: ${adminId}`);

    return {
      success: true,
      message: `${rows.length} satır işleme kuyruğuna alındı. Durumu takip etmek için jobId'yi kullanın.`,
      data: {
        jobId: importJob.id,
        totalRows: rows.length,
        status: 'PENDING',
        statusUrl: `/api/admin/products/import-jobs/${importJob.id}`,
      },
    };
  }
}
