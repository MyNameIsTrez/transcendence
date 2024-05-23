import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { MyChat } from './mychat.entity';
import { User } from './user.entity';
import { Achievements } from './achievements.entity';
import { AchievementsService } from './achievements.service';
import { Match } from './match.entity';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([MyChat, Achievements, Match, User])],
  providers: [UsersService, AchievementsService, MatchService],
  exports: [UsersService, MatchService],
})
export class UsersModule {}
