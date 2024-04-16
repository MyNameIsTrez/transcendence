import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ApiModule,
    AuthModule,
    ChatModule,
    GameModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'db',
        port: parseInt(configService.getOrThrow<string>('POSTGRES_PORT')),
        username: configService.getOrThrow<string>('POSTGRES_USER'),
        password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: configService.getOrThrow<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true, // TODO: Remove, as it's unsafe in production according to the docs!
        logging: true, // TODO: Remove?
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
