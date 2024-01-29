import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      // TOOD: Sander couldn't verify that this does anything; remove?
      exclude: ['/api/(.*)'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
