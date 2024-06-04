import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatModule } from '../../chat/chat.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ChatModule, UserModule],
  controllers: [ChatController],
})
export class ApiChatModule {}
