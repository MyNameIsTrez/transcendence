import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserModule } from '../../user/user.module';
import { GameModule } from '../../game/game.module';
import { UserGateway } from './user.gateway';
import { ChatModule } from '../../chat/chat.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [GameModule, UserModule, ChatModule, AuthModule],
  controllers: [UserController],
  providers: [UserGateway],
})
export class ApiUserModule {}
