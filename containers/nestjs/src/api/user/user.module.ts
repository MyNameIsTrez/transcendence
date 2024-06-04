import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserModule } from '../../user/user.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [UserModule, ChatModule],
  controllers: [UserController],
})
export class ApiUserModule {}
