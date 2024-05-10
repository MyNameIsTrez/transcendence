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

  public create(intra_id: number, chat: Chat): Promise<Chat> {
    this.usersService.addToChat(intra_id, chat.chat_id, chat.name);

    return this.chatRepository.save(chat);
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

    // If the user is already in this chat, they can't join it again
    if (chat.users.includes(intra_id)) {
      return false;
    }

    // If this is not a protected chat, skip checking the password
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
