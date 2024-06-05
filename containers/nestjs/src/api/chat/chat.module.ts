import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatModule } from '../../chat/chat.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ChatModule, UserModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class ApiChatModule {}
