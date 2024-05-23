import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
// import { ChatService } from 'src/chat/chat.service';
import { User } from './user.entity';
import { Chat } from 'src/chat/chat.entity';
// import { ChatModule } from 'src/chat/chat.module';
import { Achievements } from './achievements';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Achievements, User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
