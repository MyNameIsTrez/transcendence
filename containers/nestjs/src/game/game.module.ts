import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [GameGateway],
})
export class GameModule {}
