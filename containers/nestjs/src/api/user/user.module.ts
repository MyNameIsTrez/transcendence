import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersModule } from '../../users/users.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [UsersModule, ChatModule],
  controllers: [UserController],
})
export class ApiUserModule {}
