import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [GameGateway],
})
export class GameModule {}
