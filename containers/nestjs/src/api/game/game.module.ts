import { Module } from '@nestjs/common';
import { GameModule } from '../../game/game.module';
import { UserModule } from '../../user/user.module';
import { AuthModule } from '../../auth/auth.module';
import { GameGateway } from './game.gateway';

@Module({
  imports: [GameModule, UserModule, AuthModule],
  providers: [GameGateway],
})
export class ApiGameModule {}
