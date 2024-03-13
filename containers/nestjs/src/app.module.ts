import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GameModule } from './game/game.module'
import { UsersModule } from './users/users.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AppGateway } from './app.gateway'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true // Caches values from the process.env object
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: +(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true, // TODO: Remove?
      logging: true // TODO: Disable?
    }),
    GameModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway]
})
export class AppModule {}
