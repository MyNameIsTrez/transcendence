import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
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

  create(intra_id: number, chat: Chat): Promise<Chat> {
    this.usersService.addToChat(intra_id, chat.chat_id, chat.name);

    return this.chatRepository.save(chat);
  }

  hashPassword(password: string) {
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

  getName(chat_id: string) {
    return this.chatRepository.findOneBy({ chat_id }).then((chat) => {
      if (chat) {
        return chat.name;
      } else {
        throw new BadRequestException('Invalid chat_id');
      }
    });
  }
}
