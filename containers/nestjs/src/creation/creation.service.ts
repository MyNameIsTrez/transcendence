import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creation } from './creation.entity';

@Injectable()
export class CreationService {
  constructor(
    @InjectRepository(Creation)
    private readonly creationRepository: Repository<Creation>,
  ) {}

  async create() {
    await this.creationRepository.save({ id: 1 });
  }

  async getCreationDate() {
    return (await this.creationRepository.findOneBy({ id: 1 })).creationDate;
  }
}
