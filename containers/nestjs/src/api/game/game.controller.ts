import { Controller, Get, Request } from '@nestjs/common';
import { GameService } from '../../game/game.service';

@Controller('api/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('invitations')
  public async getInvitations(@Request() req) {
    return await this.gameService.getInvitations(req.user.intra_id);
  }
}
