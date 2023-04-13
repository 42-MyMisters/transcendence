import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import config from 'config';
import { Logger } from '@nestjs/common';

import cookieParser from 'cookie-parser';
import { setSwagger } from './swagger/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const serverConfig: any = config.get('server');
  const port: any = serverConfig.port;

  app.enableCors({
    origin: '*',
  });

  setSwagger(app);

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}

bootstrap();
