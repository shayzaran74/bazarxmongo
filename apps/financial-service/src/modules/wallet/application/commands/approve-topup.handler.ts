import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { ApproveTopUpCommand } from './approve-topup.command';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { TopUpWalletCommand } from './topup-wallet.command';
import { NotFoundException } from '@barterborsa/shared-core';

@CommandHandler(ApproveTopUpCommand)
export class ApproveTopUpHandler implements ICommandHandler<ApproveTopUpCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ApproveTopUpCommand): Promise<void> {
    const { requestId, adminId } = command;

    const request = await this.prisma.accountTopUpRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Top-up request not found: ${requestId}`);
    }

    if (request.status !== 'PENDING') {
      throw new Error(`Request is already processed: ${request.status}`);
    }

    // 1. Update request status
    await this.prisma.accountTopUpRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        processedAt: new Date(),
        processedBy: adminId,
      },
    });

    // 2. Add balance to user's wallet
    await this.commandBus.execute(
      new TopUpWalletCommand(
        request.userId,
        request.amount,
        'TRY',
        `APPROVE-${requestId}`
      )
    );
  }
}
