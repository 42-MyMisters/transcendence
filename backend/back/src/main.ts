import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import config from 'config';
import { Logger, ValidationPipe } from '@nestjs/common';

import cookieParser from 'cookie-parser';
import { setSwagger } from './swagger/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const serverConfig: any = config.get('server');
  const port: any = serverConfig.port;

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  setSwagger(app);

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}

bootstrap();
