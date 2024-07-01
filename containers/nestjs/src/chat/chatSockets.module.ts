import { Module } from '@nestjs/common';
import ChatSockets from './chat.sockets';

@Module({
  providers: [ChatSockets],
  exports: [ChatSockets],
})
export class ChatSocketsModule {}
