import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(intra_id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ intra_id });
  }

  async remove(intra_id: number): Promise<void> {
    await this.usersRepository.delete(intra_id);
  }

  getUsername(intra_id: number): Promise<string> {
    return this.findOne(intra_id).then((user) => {
      return user?.displayname;
    });
  }

  getMyChats(intra_id: number): Promise<string[]> {
    return this.findOne(intra_id).then((user) => {
      return user?.my_chats;
    });
  }
}
