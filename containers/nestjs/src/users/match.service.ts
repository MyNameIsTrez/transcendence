import { Injectable } from '@nestjs/common';
import { Match } from './match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Gamemode } from './match.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  async create(
    leftPlayer: User,
    rightPlayer: User,
    disconnectedPlayer: User,
    leftScore: number,
    rightScore: number,
    gamemode: Gamemode,
  ) {
    return await this.matchRepository.save({
      players: [leftPlayer, rightPlayer],
      disconnectedPlayer,
      leftScore,
      rightScore,
      gamemode,
    });
  }
}
