import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {})

  // TODO: What is this for? I got it from here: https://medium.com/js-dojo/how-to-serve-vue-with-nest-f23f10b33e1
  app.setGlobalPrefix('api')

  await app.listen(4242)
}
bootstrap()
