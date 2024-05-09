import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ConfigModule } from '@nestjs/config';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    TypeOrmModule.forFeature([Chat, Message, Mute]),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
