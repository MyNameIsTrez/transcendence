import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';

@Injectable()
export class ApiChatService {
  create(chat: Chat): Promise<Chat> {
    return this.chatRepository.save(chat);
  }
}
