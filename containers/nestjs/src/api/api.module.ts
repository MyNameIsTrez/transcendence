import { Module } from '@nestjs/common';
import { ApiChatModule } from './chat/chat.module';
import { ApiPublicModule } from './public/public.module';
import { ApiUserModule } from './user/user.module';

@Module({
  imports: [ApiChatModule, ApiPublicModule, ApiUserModule],
})
export class ApiModule {}
