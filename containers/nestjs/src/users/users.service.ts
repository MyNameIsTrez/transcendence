import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { MyChat } from './mychat.entity';
import { createReadStream } from 'fs';

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

  // TODO: Remove?
  // findAll(): Promise<User[]> {
  //   return this.usersRepository.find();
  // }

  findOne(intra_id: number): Promise<User> {
    const user = this.usersRepository.findOneBy({ intra_id });
    if (!user) {
      throw new BadRequestException('No user with this intra_id exists');
    }
    return user;
  }

  findOneByUsername(username: string): Promise<User> {
    const user = this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException('No user with this username exists');
    }
    return user;
  }
  
  // TODO: Remove?
  // async remove(intra_id: number): Promise<void> {
  //   await this.usersRepository.delete(intra_id);
  // }

  hasUser(intra_id: number) {
    return this.usersRepository.existsBy({ intra_id });
  }

  getUsername(intra_id: number): Promise<string> {
    return this.findOne(intra_id).then((user) => {
      return user.username;
    });
  }


  async setUsername(intra_id: number, username: string) {
    const result = await this.usersRepository.update(
      { intra_id },
      { username: username },
    );
    if (result.affected === 0) {
      throw new BadRequestException('No user with this intra_id exists');
    }
  }

  set2faSecret(intra_id: number, secret: string) {
    this.usersRepository.update(
      { intra_id },
      { twoFactorAuthenticationSecret: secret },
    );
  }

  set2faState(intra_id: number, state: boolean, secret: string) {
    // State doens't HAVE to be checked but it is nice to have this just in case someone locks themselfs out of their account some way
    if (state == false && !secret) {
      throw new BadRequestException("Can't enable 2fa without a secret");
    }
    this.usersRepository.update(
      { intra_id },
      { isTwoFactorAuthenticationEnabled: state },
    );
  }

  async addToChat(intra_id: number, chat_id: string, name: string) {
    const myChat = new MyChat();
    myChat.chat_id = chat_id;
    myChat.name = name;
    myChat.user = [await this.findOne(intra_id)];
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
        console.log("my chats: ", user?.my_chats)
        return user?.my_chats;
      });
  }

  async turnOnTwoFactorAuthentication(intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      this.set2faState(intra_id, true, user.twoFactorAuthenticationSecret);
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      this.set2faSecret(intra_id, secret);
    }
  }

  getProfilePicture(intra_id: number) {
    const stream = createReadStream(
      `profile_pictures/${intra_id}.png`,
      'base64',
    );

    // If you add this line back, with nothing between the {},
    // it'll return 200 when the png doesn't exist
    // stream.on('error', () => {
    // TODO: Why does this not work?? It seems like the stream is catching it
    // throw new BadRequestException('foo');
    // });

    return new StreamableFile(stream);
  }
}
