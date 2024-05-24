import { Injectable } from '@nestjs/common';
import { Achievements } from './achievements.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievements)
    private readonly achievementsRepository: Repository<Achievements>,
  ) {}

  create() {
    return this.achievementsRepository.save({});
  }

  async updateAchievement(achievement_id: number, achievement: any) {
    this.achievementsRepository.update({ id: achievement_id }, achievement);
  }

  wonOnce(achievement_id: number) {
    this.updateAchievement(achievement_id, { wonOnce: true });
  }

  wonOneHundredTimes(achievement_id: number) {
    this.updateAchievement(achievement_id, { wonOneHundredTimes: true });
  }

  lostOnce(achievement_id: number) {
    this.updateAchievement(achievement_id, { lostOnce: true });
  }

  lostOneHundredTimes(achievement_id: number) {
    this.updateAchievement(achievement_id, { lostOneHundredTimes: true });
  }
}
