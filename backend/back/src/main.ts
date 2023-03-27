import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import config from 'config';
import { Logger } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig: any = config.get('server');
  const port: any = serverConfig.port;

  app.enableCors({
    origin: '*',
  });

  const swagger = new DocumentBuilder()
    .setTitle('My Misters API')
    .setDescription('API description')
    .setVersion('1.0')
    // .addTag('backend')
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();
