import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from './users/users.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppGateway } from './app.gateway'
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'foo',
      password: 'hunter2',
      database: 'bar',
      autoLoadEntities: true,
      synchronize: true, // TODO: Remove?
      logging: true // TODO: Disable?
    }),
    UsersModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway]
})
export class AppModule {}
