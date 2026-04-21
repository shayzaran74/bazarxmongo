import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { UpdateUserRoleCommand } from './update-user-role.command';

@CommandHandler(UpdateUserRoleCommand)
export class UpdateUserRoleHandler
  implements ICommandHandler<UpdateUserRoleCommand> {

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateUserRoleCommand) {
    const { userId, role } = command;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: role.toUpperCase() as any }
    });

    return { success: true };
  }
}
