import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import config from 'config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig : any = config.get('server');
  const port : any = serverConfig.port;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}
bootstrap();