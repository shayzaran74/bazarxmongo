import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectTopUpCommand } from './reject-topup.command';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { NotFoundException } from '@barterborsa/shared-core';

@CommandHandler(RejectTopUpCommand)
export class RejectTopUpHandler implements ICommandHandler<RejectTopUpCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RejectTopUpCommand): Promise<void> {
    const { requestId, adminId, reason } = command;

    const request = await this.prisma.accountTopUpRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException(`Top-up request not found: ${requestId}`);
    }

    if (request.status !== 'PENDING') {
      throw new Error(`Request is already processed: ${request.status}`);
    }

    await this.prisma.accountTopUpRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        processedAt: new Date(),
        processedBy: adminId,
      },
    });
  }
}
