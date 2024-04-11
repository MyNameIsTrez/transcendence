import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message, Mute])],
  providers: [ChatGateway],
})
export class ChatModule {}
