import { Module } from '@nestjs/common';
import { GameModule } from '../../game/game.module';
import { UserModule } from '../../user/user.module';
import { AuthModule } from '../../auth/auth.module';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';

@Module({
  imports: [GameModule, UserModule, AuthModule],
  controllers: [GameController],
  providers: [GameGateway],
})
export class ApiGameModule {}
