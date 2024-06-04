import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Chat } from '../chat/chat.entity';
import { Achievements } from './achievements.entity';
import { AchievementsService } from './achievements.service';
import { Match } from './match.entity';
import { MatchService } from './match.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Achievements, Match, User])],
  providers: [UserService, AchievementsService, MatchService],
  exports: [UserService, MatchService],
})
export class UserModule {}
