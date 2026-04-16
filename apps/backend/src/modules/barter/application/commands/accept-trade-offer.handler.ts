// apps/backend/src/modules/barter/application/commands/accept-trade-offer.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AcceptTradeOfferCommand } from './accept-trade-offer.command';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { SwapSession } from '../../domain/entities/swap-session.entity';
import { BarterPart } from '../../domain/entities/barter-part.entity';
import { CollateralCalculatorService } from '../services/collateral-calculator.service';
import { DomainException } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RabbitMQService } from '@barterborsa/shared-messaging';

@CommandHandler(AcceptTradeOfferCommand)
export class AcceptTradeOfferHandler implements ICommandHandler<AcceptTradeOfferCommand> {
  constructor(
    @Inject('ITradeOfferRepository') private readonly offerRepository: ITradeOfferRepository,
    @Inject('ISwapSessionRepository') private readonly sessionRepository: ISwapSessionRepository,
    private readonly collateralCalculator: CollateralCalculatorService,
    private readonly prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQService,
  ) {}

  async execute(command: AcceptTradeOfferCommand) {
    const offer = await this.offerRepository.findById(command.offerId);
    if (!offer) throw new DomainException('Trade offer not found');

    offer.accept();

    // Calculate collateral based on requested items total value (simplified)
    const totalOfferedValue = offer.getProps().offeredItems.reduce(
      (acc, item) => acc.plus(item.getProps().estimatedValue),
      new (offer.getProps().cashAmount as any).constructor(0)
    );
    const collateralAmount = this.collateralCalculator.calculateCollateral(totalOfferedValue);

    const session = SwapSession.create(
      offer.id,
      offer.getProps().fromCompanyId,
      offer.getProps().toCompanyId,
      collateralAmount
    );

    // Create BarterParts (legs)
    const part1 = BarterPart.create(
      session.id,
      1,
      offer.getProps().fromCompanyId,
      offer.getProps().toCompanyId
    );
    const part2 = BarterPart.create(
      session.id,
      2,
      offer.getProps().toCompanyId,
      offer.getProps().fromCompanyId
    );

    await this.prisma.$transaction(async (tx) => {
      await this.offerRepository.save(offer);
      await (tx as any).swapSession.create({
         data: {
           id: session.id,
           tradeOfferId: offer.id,
           initiatorId: session.getProps().initiatorId,
           receiverId: session.getProps().receiverId,
           collateralAmount: session.getProps().collateralAmount,
           collateralCurrency: session.getProps().collateralCurrency,
           collateralStatus: session.getProps().collateralStatus,
           status: session.getProps().status,
           timeoutAt: session.getProps().timeoutAt,
           shipmentMode: session.getProps().shipmentMode,
         }
      });
      
      await (tx as any).barterPart.createMany({
         data: [
           {
              id: part1.id,
              swapSessionId: session.id,
              partNumber: 1,
              senderId: part1.getProps().senderId,
              recipientId: part1.getProps().recipientId,
              status: part1.getProps().status,
           },
           {
              id: part2.id,
              swapSessionId: session.id,
              partNumber: 2,
              senderId: part2.getProps().senderId,
              recipientId: part2.getProps().recipientId,
              status: part2.getProps().status,
           }
         ]
      });
    });

    await this.rabbitMQ.publish('barter.events', 'offer.accepted', {
      offerId: offer.id,
      sessionId: session.id,
      fromCompanyId: offer.getProps().fromCompanyId,
      toCompanyId: offer.getProps().toCompanyId,
      initiatorId: offer.getProps().initiatorId,
      receiverId: offer.getProps().receiverId,
      // Provide addresses here if they were part of the offer (assuming for now)
      fromAddress: {}, // Should be populated from company/offer
      toAddress: {},
      collateralAmount: session.getProps().collateralAmount,
    });

    return { success: true, sessionId: session.id };
  }
}
