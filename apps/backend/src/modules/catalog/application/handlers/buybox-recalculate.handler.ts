// apps/backend/src/modules/catalog/application/handlers/buybox-recalculate.handler.ts
// BuyboxRecalculateHandler — BullMQ job, buybox score yeniden hesaplanır
// Tetikleyiciler: fiyat değişti, stok değişti, satıcı puanı güncellendi

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { BuyboxCalculatorService } from '../services/buybox-calculator.service';
import { IListingRepository } from '../../domain/repositories/listing.repository.interface';
import { BuyboxHistory } from '@barterborsa/shared-persistence';

export const BUYBOX_RECALCULATE_QUEUE = 'buybox.recalculate';

export interface BuyboxRecalculateJobData {
  productId: string;
  reason: 'price_changed' | 'stock_changed' | 'rating_changed' | 'delivery_changed' | 'manual';
}

@Processor(BUYBOX_RECALCULATE_QUEUE)
export class BuyboxRecalculateHandler extends WorkerHost {
  private readonly logger = new Logger(BuyboxRecalculateHandler.name);

  constructor(
    private readonly buyboxCalculator: BuyboxCalculatorService,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {
    super();
  }

  async process(job: Job<BuyboxRecalculateJobData>): Promise<void> {
    const { productId, reason } = job.data;

    this.logger.log('Buybox recalculate job başladı', { productId, reason });

    try {
      const winners = await this.buyboxCalculator.calculateProductBuybox(productId);

      // Winner'ı veritabanında güncelle
      for (const winner of winners) {
        await this.updateListingBuyboxStatus(winner);
      }

      this.logger.log('Buybox recalculate job tamamlandı', {
        productId,
        winnerId: winners.find(w => w.isBuyboxWinner)?.listingId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Buybox recalculate job hatası', { productId, error: msg });
      throw err;
    }
  }

  private async updateListingBuyboxStatus(winner: { listingId: string; vendorId: string; score: number; isBuyboxWinner: boolean }): Promise<void> {
    // Önceki winner'ı bul (history için)
    const previousWinner = winner.isBuyboxWinner
      ? await this.getPreviousWinner(winner.listingId)
      : undefined;

    // Listing'i güncelle — isBuyboxWinner ve buyboxScore
    await this.listingRepo.update(winner.listingId, {
      isBuyboxWinner: winner.isBuyboxWinner,
      buyboxScore: winner.score,
    });

    // BuyboxHistory kaydı oluştur
    if (winner.isBuyboxWinner) {
      await this.saveBuyboxHistory({
        productId: winner.listingId, // TODO: gerçek productId çekilmeli
        listingId: winner.listingId,
        vendorId: winner.vendorId,
        score: winner.score,
        priceScore: 0,  // TODO: gerçek değerler
        ratingScore: 0,
        deliveryScore: 0,
        stockScore: 0,
        previousWinnerId: previousWinner,
        reason: 'score_updated',
      });
    }

    this.logger.log('Listing buybox status güncellendi', {
      listingId: winner.listingId,
      isBuyboxWinner: winner.isBuyboxWinner,
      score: winner.score,
    });
  }

  private async getPreviousWinner(listingId: string): Promise<string | undefined> {
    // Son buybox history'sinden önceki winner'ı bul
    const history = await BuyboxHistory.findOne({
      listingId,
      isBuyboxWinner: true,
    }).sort({ winnerAt: -1 }).exec();
    return history?.previousWinnerId;
  }

  private async saveBuyboxHistory(data: {
    productId: string;
    listingId: string;
    vendorId: string;
    score: number;
    priceScore: number;
    ratingScore: number;
    deliveryScore: number;
    stockScore: number;
    previousWinnerId?: string;
    reason?: string;
  }): Promise<void> {
    const id = 'bh-' + data.listingId + '-' + crypto.randomUUID();
    await BuyboxHistory.create({
      id,
      productId: data.productId,
      listingId: data.listingId,
      vendorId: data.vendorId,
      score: data.score,
      priceScore: data.priceScore,
      ratingScore: data.ratingScore,
      deliveryScore: data.deliveryScore,
      stockScore: data.stockScore,
      winnerAt: new Date(),
      previousWinnerId: data.previousWinnerId,
      reason: data.reason,
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<BuyboxRecalculateJobData>, err: Error): void {
    this.logger.error('Buybox recalculate job başarısız', {
      jobId: job.id,
      productId: job.data.productId,
      error: err.message,
    });
  }
}