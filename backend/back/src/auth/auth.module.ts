import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/database/database.module';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
<<<<<<< HEAD
				expiresIn: process.env.JWT_EXPIRES_IN,
=======
				expiresIn: Number(process.env.JWT_EXPIRES_IN),
>>>>>>> b7459260804d0a53cb1036b70c40e9486b841d64
			}
		}),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		DatabaseModule,
	],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
