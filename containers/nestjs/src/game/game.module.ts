import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { GameService } from './game.service';

@Module({
  imports: [ConfigModule, forwardRef(() => UserModule), AuthModule],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
