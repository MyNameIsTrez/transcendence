import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ChatModule],
  controllers: [ChatController],
})
export class ApiChatModule {}
