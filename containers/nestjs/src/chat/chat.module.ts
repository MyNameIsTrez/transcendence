import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';
import { ChatService } from './chat.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    TypeOrmModule.forFeature([Chat, Message, Mute]),
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
