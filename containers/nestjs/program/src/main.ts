import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4242);

  const interval_ms = 1000;
  setInterval(() => console.log('foo'), interval_ms);
}
bootstrap();
