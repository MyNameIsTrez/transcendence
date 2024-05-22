import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, UsersModule, AuthModule],
  providers: [GameGateway],
})
export class GameModule {}
