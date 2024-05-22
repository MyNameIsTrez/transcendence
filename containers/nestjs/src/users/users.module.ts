import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { MyChat } from './mychat.entity';
import { User } from './user.entity';
import { Achievements } from './achievements';

@Module({
  imports: [TypeOrmModule.forFeature([MyChat, Achievements, User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
