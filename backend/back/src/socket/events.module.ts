import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
@Module({
  imports: [],
  providers: [EventsGateway],
})
export class EventsModule {}
