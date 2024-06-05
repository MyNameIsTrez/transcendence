import { Module } from '@nestjs/common';
import { ApiChatModule } from './chat/chat.module';
import { ApiGameModule } from './game/game.module';
import { ApiUserModule } from './user/user.module';

@Module({
  imports: [ApiChatModule, ApiGameModule, ApiUserModule],
})
export class ApiModule {}
