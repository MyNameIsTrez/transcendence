import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { PublicModule } from './public/public.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ChatModule, PublicModule, UserModule],
})
export class ApiModule {}
