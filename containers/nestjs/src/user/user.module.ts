import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Chat } from '../chat/chat.entity';
import { Achievements } from './achievements.entity';
import { AchievementsService } from './achievements.service';
import { Match } from './match.entity';
import { MatchService } from './match.service';
import { ConfigModule } from '@nestjs/config';
import UserSockets from './user.sockets';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Achievements, Match, User]),
    ConfigModule,
  ],
  providers: [UserService, AchievementsService, MatchService, UserSockets],
  exports: [UserService, MatchService, UserSockets],
})
export class UserModule {}
