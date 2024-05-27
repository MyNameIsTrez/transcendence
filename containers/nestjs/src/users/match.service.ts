import { Injectable } from '@nestjs/common';
import { Match } from './match.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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
  ) {
    return await this.matchRepository.save({
      players: [leftPlayer, rightPlayer],
      disconnectedPlayer,
      leftScore,
      rightScore,
    });
  }
}
