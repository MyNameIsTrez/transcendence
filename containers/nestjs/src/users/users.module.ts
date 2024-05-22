import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { MyChat } from './mychat.entity';
import { User } from './user.entity';
import { Achievements } from './achievements';
import { AchievementsService } from './achievements.service';

@Module({
  imports: [TypeOrmModule.forFeature([MyChat, Achievements, User])],
  providers: [UsersService, AchievementsService],
  exports: [UsersService],
})
export class UsersModule {}
