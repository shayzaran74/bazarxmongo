import { Controller, Post, Body, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateLocationCommand } from '../application/commands/update-location.command';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post(':shipmentId/location')
  async updateLocation(
    @Param('shipmentId') shipmentId: string,
    @Body() body: { latitude: number; longitude: number; speed?: number; heading?: number }
  ) {
    await this.commandBus.execute(
      new UpdateLocationCommand(
        shipmentId,
        body.latitude,
        body.longitude,
        body.speed,
        body.heading
      )
    );
    return { success: true };
  }
}
