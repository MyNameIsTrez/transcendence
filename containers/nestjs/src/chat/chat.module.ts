import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  // controllers: [ChatController],
  providers: [ChatGateway], // Include WebSocket gateway if needed
  // providers: [ChatService, AppGateway], // Include WebSocket gateway if needed
})
export class ChatModule {}
