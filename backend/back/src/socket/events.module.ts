import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [UserModule, AuthModule],
  providers: [EventsGateway],
})
export class EventsModule {}
