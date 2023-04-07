import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('My Misters API')
    .setDescription('Backend API description')
    .setVersion('1.0')
    // .addTag('backend')
    .addBearerAuth()
    .addOAuth2()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}
