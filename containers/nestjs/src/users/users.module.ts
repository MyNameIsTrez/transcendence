import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Chat } from '../chat/chat.entity';
import { Achievements } from './achievements.entity';
import { AchievementsService } from './achievements.service';
import { Match } from './match.entity';
import { MatchService } from './match.service';
import { TransJwtModule } from '../auth/trans-jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Achievements, Match, User]),
    TransJwtModule,
  ],
  providers: [UsersService, AchievementsService, MatchService],
  exports: [UsersService, MatchService],
})
export class UsersModule {}
