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

  async create() {
    return await this.achievementsRepository.save({});
  }

  async updateAchievement(achievement_id: number, achievement: any) {
    await this.achievementsRepository.update(
      { id: achievement_id },
      achievement,
    );
  }

  async wonOnce(achievement_id: number) {
    await this.updateAchievement(achievement_id, { wonOnce: true });
  }

  async wonOneHundredTimes(achievement_id: number) {
    await this.updateAchievement(achievement_id, { wonOneHundredTimes: true });
  }

  async lostOnce(achievement_id: number) {
    await this.updateAchievement(achievement_id, { lostOnce: true });
  }

  async lostOneHundredTimes(achievement_id: number) {
    await this.updateAchievement(achievement_id, { lostOneHundredTimes: true });
  }
}
