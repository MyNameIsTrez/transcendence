import { Module } from '@nestjs/common';
import { ApiChatModule } from './chat/chat.module';
import { ApiUserModule } from './user/user.module';

@Module({
  imports: [ApiChatModule, ApiUserModule],
})
export class ApiModule {}
