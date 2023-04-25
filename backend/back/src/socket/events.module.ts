import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import config from 'config';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/user/user.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [UserModule],
  providers: [EventsGateway],
})
export class EventsModule {}
