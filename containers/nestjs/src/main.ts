import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})

  // TODO: What is this for? I got it from here: https://medium.com/js-dojo/how-to-serve-vue-with-nest-f23f10b33e1
  app.setGlobalPrefix('api')

  const config = app.get(ConfigService)
  const port = config.getOrThrow<number>('NESTJS_PORT')
  await app.listen(port)

  console.log(`Application is running on ${await app.getUrl()}`)
}
bootstrap()
