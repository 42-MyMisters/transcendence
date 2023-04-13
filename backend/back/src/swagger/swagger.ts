import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UserModule } from 'src/user/user.module';

export function setSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('My Misters API')
    .setDescription('Backend API description')
    .setVersion('1.0')
    // .addTag('backend')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      in: 'header',
      description: 'Bearer refreshToken <br><br> "Bearer"는 빼고, refreshToken 값만 입력하세요.',
    }, 'refreshToken')
    .addCookieAuth('accessToken', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      in: 'header',
    },)
    // .addOAuth2()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/', app, document);
}
