import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { MyChat } from './mychat.entity';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MyChat, User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
