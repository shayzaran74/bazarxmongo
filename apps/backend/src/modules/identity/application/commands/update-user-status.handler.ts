import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateUserStatusCommand } from './update-user-status.command';

@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusHandler
  implements ICommandHandler<UpdateUserStatusCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateUserStatusCommand) {
    const { userId, status } = command;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: status.toUpperCase() as any }
    });

    return { success: true };
  }
}
