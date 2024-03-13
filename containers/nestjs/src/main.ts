import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})

  const config = app.get(ConfigService)
  const port = config.getOrThrow<number>('VITE_PORT')
  await app.listen(port)

  console.log(`Application is running on ${await app.getUrl()}`)
}
bootstrap()
