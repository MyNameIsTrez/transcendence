import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatModule } from '../../chat/chat.module';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [ChatModule, UserModule],
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class ApiChatModule {}
