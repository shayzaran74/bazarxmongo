// apps/backend/src/modules/catalog/application/commands/queue-import-products.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { PRODUCT_IMPORT_QUEUE } from '@barterborsa/shared-queue';
import { ProductImportJobData } from '../workers/product-import.worker';
import { QueueImportProductsCommand } from './queue-import-products.command';

const MAX_ROWS = 50_000;

@CommandHandler(QueueImportProductsCommand)
export class QueueImportProductsHandler
  implements ICommandHandler<QueueImportProductsCommand>
{
  private readonly logger = new Logger(QueueImportProductsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(PRODUCT_IMPORT_QUEUE) private readonly importQueue: Queue,
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

    const emptyNameCount = rows.filter(r => !r.name && !r.title).length;
    if (emptyNameCount === rows.length) {
      throw new BadRequestException('Hiçbir satırda ürün adı bulunamadı');
    }

    const importJob = await this.prisma.importJob.create({
      data: {
        adminId,
        status: 'PENDING',
        totalRows: rows.length,
      },
    });

    const jobData: ProductImportJobData = {
      jobId: importJob.id,
      adminId,
      rows,
    };

    await this.importQueue.add(
      'import-products',
      jobData,
      {
        jobId: importJob.id,
        priority: 10,
      },
    );

    this.logger.log(
      `Import job kuyruğa eklendi: ${importJob.id} — ${rows.length} satır, admin: ${adminId}`,
    );

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
