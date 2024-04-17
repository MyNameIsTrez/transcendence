import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { MyChat } from './mychat.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(MyChat)
    private readonly myChatRepository: Repository<MyChat>,
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
      return user?.username;
    });
  }

  setUsername(intra_id: number, username: string) {
    this.usersRepository.update({ intra_id }, { username: username });
  }

  async addToChat(intra_id: number, chat_id: string, name: string) {
    const myChat = new MyChat();
    myChat.chat_id = chat_id;
    myChat.name = name;
    myChat.user = await this.findOne(intra_id);
    await this.myChatRepository.save(myChat);
  }

  getMyChats(intra_id: number): Promise<MyChat[]> {
    return this.usersRepository
      .findOne({
        where: { intra_id },
        relations: {
          my_chats: true,
        },
      })
      .then((user) => {
        return user?.my_chats;
      });
  }
}
