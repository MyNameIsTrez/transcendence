import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, UserModule, AuthModule],
  providers: [GameGateway],
})
export class GameModule {}
