import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Mute) private readonly muteRepository: Repository<Mute>,
    private readonly usersService: UsersService,
  ) {}

  create(intra_id: number, chat: Chat): Promise<Chat> {
    this.usersService.addToChat(intra_id, chat.chat_id, chat.name);

    return this.chatRepository.save(chat);
  }

  hashPassword(password: string) {
    // TODO: Hashing
    return password;
  }

  getName(chat_id: string) {
    return this.chatRepository.findOneBy({ chat_id }).then((chat) => {
      if (chat) {
        return { name: chat.name };
      } else {
        throw new BadRequestException('Invalid chat_id');
      }
    });
  }
}
