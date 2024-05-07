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
    console.log("chat", chat)
    return this.usersService.addToChat(intra_id, chat);
  }

  async addUser(chat_id: string, username: string) {
    console.log("chat_id: ", chat_id, "username: ", username)
    let user = await this.usersService.findOneByUsername(username);
    if (!user)
      return
    console.log("user: ", user)
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true } })
      .then(async (my_chat) => {
        if (!my_chat) { return }
        my_chat.users = [...my_chat.users, user]
        await this.chatRepository.save(my_chat)
      })
  }

  // check first if the user to make admin is part of the channel
  async addAdmin(chat_id: string, username: string) {
    console.log("chat_id: ", chat_id, "username: ", username)
    let user = await this.usersService.findOneByUsername(username);
    if (!user)
      return
    console.log("user: ", user)
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { admins: true } })
      .then(async (my_chat) => {
        if (!my_chat) { return }
        my_chat.admins = [...my_chat.admins, user]
        await this.chatRepository.save(my_chat)
      })
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

  public async kickUser(chat_id: string, username: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, admins: true } })
      .then(async (chat) => {
        if (!chat) { return false }

        const user = await this.usersService.findOneByUsername(username)
        if (!user) { return false }
        
        const admins = [...chat.admins]
        admins.forEach(async admin => {
          if (admin.intra_id === user.intra_id) {
            return false
          }
          else {
            chat.users = chat.users.filter(u => u.intra_id !== user.intra_id);
            let result = await this.chatRepository.save(chat)
            if (result)
              return true
          }
        })
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

  getHistory(chat_id: string) {
    return this.chatRepository
    .findOne({ where: { chat_id }, relations: { history: true } })
    .then(async (chat) => {
      if (!chat) { return }

      return chat.history
    });
  }

  getAdmins(chat_id: string) {
    return this.chatRepository
    .findOne({ where: { chat_id }, relations: { admins: true } })
    .then(async (chat) => {
      if (!chat) { return }

      return chat.admins
    });
  }

  getOwner(chat_id: string) {
    return this.chatRepository
    .findOne({ where: { chat_id } })
    .then(async (chat) => {
      if (!chat) { return }

      return chat.owner
    });
  }

  handleMessage(sender: number, chat_id: string, body: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { history: true } })
      .then(async (chat) => {
        if (!chat) { return false }

        const message = new Message();
        message.sender = sender;
        message.body = body;
        await this.messageRepository.save(message);

        chat.history = [...chat.history, message]
        let result = await this.chatRepository.save(chat)
        if (result)
          return true
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
