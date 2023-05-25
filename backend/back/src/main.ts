import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Logger, ValidationPipe } from '@nestjs/common';

import cookieParser from 'cookie-parser';
import { setSwagger } from './swagger/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
<<<<<<< HEAD
  const port: string = config.get<string>('server.port');
  const frontUrl: string = config.get<string>('public-url.frontend');
  app.enableCors({
    origin: [frontUrl],
=======
  const port: number = Number(process.env.BACKEND_PORT);

  app.enableCors({
    origin: [process.env.FRONTEND_URL || "https://localhost"],
>>>>>>> 9e630b5be567f65ad1493b8992e2a1a490c4bc42
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  setSwagger(app);

  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}

bootstrap();
