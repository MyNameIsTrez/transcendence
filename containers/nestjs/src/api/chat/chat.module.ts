import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatModule } from '../../chat/chat.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ChatModule, UsersModule],
  controllers: [ChatController],
})
export class ApiChatModule {}
