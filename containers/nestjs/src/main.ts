import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CreationService } from './creation/creation.service';
import { useContainer } from 'class-validator';
import { UserService } from './user/user.service';

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

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const creationService = app.get<CreationService>(CreationService);
  await creationService.create();

  const configService = app.get<ConfigService>(ConfigService);

  const userService = app.get<UserService>(UserService);
  if (configService.get('VITE_ALLOW_DEBUG_USER')) {
    await userService.createFooUser();
  }

  setInterval(() => {
    userService.updateOffline();
  }, configService.get('OFFLINE_UPDATE_MS'));

  await app.listen(configService.get('BACKEND_PORT'));
}
void bootstrap();
