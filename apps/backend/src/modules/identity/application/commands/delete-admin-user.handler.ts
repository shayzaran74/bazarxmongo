import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { DeleteAdminUserCommand } from './delete-admin-user.command';

@CommandHandler(DeleteAdminUserCommand)
export class DeleteAdminUserHandler
  implements ICommandHandler<DeleteAdminUserCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteAdminUserCommand) {
    const { userId } = command;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }
}
