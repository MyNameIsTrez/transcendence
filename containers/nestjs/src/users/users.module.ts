import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
// import { MyChat } from './mychat.entity';
import { User } from './user.entity';
import { Chat } from 'src/chat/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
