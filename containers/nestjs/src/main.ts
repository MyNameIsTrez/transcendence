import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CreationService } from './creation/creation.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const creationService = app.get<CreationService>(CreationService);
  await creationService.create();

  const configService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get('BACKEND_PORT'));
}
bootstrap();
