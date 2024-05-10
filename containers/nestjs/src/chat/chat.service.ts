import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, Visibility } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Mute) private readonly muteRepository: Repository<Mute>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  public async create(
    intra_id: number,
    name: string,
    visibility: Visibility,
    password: string,
  ): Promise<Chat> {
    const hashed_password =
      visibility === Visibility.PROTECTED
        ? await this.hashPassword(password)
        : '';

    const chat_id = uuid();

    this.usersService.addToChat(intra_id, chat_id, name);

    return this.chatRepository.save({
      chat_id,
      name,
      users: [intra_id],
      visibility: visibility,
      hashed_password,
      owner: intra_id,
      admins: [intra_id],
    });
  }

  public hashPassword(password: string) {
    return bcrypt
      .hash(password, this.configService.get('BCRYPT_SALT_ROUNDS'))
      .then((hash) => {
        return hash;
      })
      .catch((err) => {
        console.error(err.message);
        throw new InternalServerErrorException('Hashing the password failed');
      });
  }

  public async getName(chat_id: string) {
    const chat = await this.getChat(chat_id);
    return chat.name;
  }

  private getChat(chat_id: string) {
    return this.chatRepository.findOneBy({ chat_id }).then((chat) => {
      if (chat) {
        return chat;
      } else {
        throw new BadRequestException('Invalid chat_id');
      }
    });
  }

  public async join(intra_id: number, chat_id: string, password: string) {
    const chat = await this.getChat(chat_id);

    // TODO: Add tests for these in test/public.e2e-spec.ts
    if (chat.visibility !== Visibility.PROTECTED) {
      return true;
    }

    const hash = chat.hashed_password;

    return bcrypt.compare(password, hash).then((res) => {
      console.log('res', res);

      // TODO: Add user instance to chat's 'users' db field
      // TODO: Add chat instance to user's 'my_chats' db field

      return res;
    });
  }
}
