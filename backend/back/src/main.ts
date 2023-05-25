import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';
import config from 'config';

import cookieParser from 'cookie-parser';
import { setSwagger } from './swagger/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const port: string = config.get<string>('server.port');
  const frontUrl: string = config.get<string>('public-url.frontend');
  app.enableCors({
    origin: [frontUrl],
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  setSwagger(app);

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}

bootstrap();
