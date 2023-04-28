import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { EventsGateway } from './chat.gateway';

@Module({
  imports: [UserModule],
  providers: [EventsGateway],
})
export class EventsModule { }
