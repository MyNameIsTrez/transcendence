import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  // TODO: Look up how other people are able to get away with not having such a method!
  create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save({ ...createUserDto });
  }

  // TODO: Remove this method?
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // TODO: Remove this method?
  findOne(intra_id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ intra_id: intra_id });
  }

  async remove(intra_id: number): Promise<void> {
    await this.usersRepository.delete(intra_id);
  }

  getUsername(intra_id: number): Promise<string> {
    return this.findOne(intra_id).then((user) => {
      return user.displayname;
    });
  }
}
