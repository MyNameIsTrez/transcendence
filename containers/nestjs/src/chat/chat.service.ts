import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Mute) private readonly muteRepository: Repository<Mute>,
  ) {}

  create(chat: Chat): Promise<Chat> {
    return this.chatRepository.save(chat);
  }

  hashPassword(password: string) {
    // TODO: Hashing
    return password;
  }

  getName(chat_id: string) {
    return this.chatRepository.findOneBy({ chat_id }).then((chat) => {
      return chat?.name;
    });
  }
}
