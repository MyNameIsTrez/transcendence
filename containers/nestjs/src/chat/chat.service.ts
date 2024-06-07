import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Chat, Visibility } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';
import { UserService } from '../user/user.service';

class Info {
  isAdmin: boolean;
  isBanned: boolean;
  isMute: boolean;
  isOwner: boolean;
  isProtected: boolean;
  isUser: boolean;
  isDirect: boolean;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Mute) private readonly muteRepository: Repository<Mute>,
    private readonly userService: UserService,
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

    const current_user = await this.userService.findOne(intra_id);

    return this.chatRepository.save({
      chat_id,
      name,
      users: [current_user],
      visibility: visibility,
      hashed_password,
      owner: intra_id,
      admins: [current_user],
      access_granted: [current_user],
    });
  }

  async addUser(chat_id: string, username: string) {
    const user = await this.userService.findOneByUsername(username);
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, banned: true } })
      .then(async (chat) => {
        if (chat.users.some((me) => me.intra_id == user.intra_id)) return;
        if (chat.banned.some((banned) => banned.intra_id == user.intra_id))
          return;

        chat.users.push(user);
        await this.chatRepository.save(chat);
      });
  }

  async addAdmin(chat_id: string, username: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, admins: true } })
      .then(async (chat) => {
        chat.users.forEach(async (user) => {
          if (username === user.username) {
            chat.admins.push(user);
            await this.chatRepository.save(chat);
          }
        });
      });
  }

  public hashPassword(password: string) {
    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS'));
    return bcrypt
      .hash(password, rounds)
      .then((hash) => {
        return hash;
      })
      .catch((err) => {
        console.error(err);
        throw new InternalServerErrorException('Hashing the password failed');
      });
  }

  public async banUser(chat_id: string, username: string) {
    if (!(await this.kickUser(chat_id, username))) return false;

    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, banned: true } })
      .then(async (chat) => {
        const user = await this.userService.findOneByUsername(username);
        chat.banned.push(user);
        const result = await this.chatRepository.save(chat);
        return !!result;
      });
  }

  public async kickUser(chat_id: string, username: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, admins: true } })
      .then(async (chat) => {
        const user = await this.userService.findOneByUsername(username);
        if (chat.owner == user.intra_id) return false;

        chat.users = chat.users.filter((u) => u.intra_id !== user.intra_id);
        chat.admins = chat.admins.filter((u) => u.intra_id !== user.intra_id);
        const result = await this.chatRepository.save(chat);

        return !!result;
      });
  }

  public async getName(chat_id: string) {
    return (await this.getChat(chat_id)).name;
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

  public async getHistory(chat_id: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { history: true } })
      .then(async (chat) => {
        return chat.history;
      });
  }

  public async isAdmin(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { admins: true } })
      .then(async (chat) => {
        return chat.admins.some((admin) => admin.intra_id === intra_id);
      });
  }

  public async isBanned(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { banned: true } })
      .then(async (chat) => {
        return chat.banned.some((user) => user.intra_id == intra_id);
      });
  }

  public async isOwner(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id } })
      .then(async (chat) => {
        return chat.owner === intra_id;
      });
  }

  public async isProtected(chat_id: string) {
    return this.chatRepository
      .findOne({ where: { chat_id } })
      .then(async (chat) => {
        return chat.visibility === Visibility.PROTECTED;
      });
  }

  public async isUser(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true } })
      .then(async (chat) => {
        return chat.users.some((user) => user.intra_id == intra_id);
      });
  }

  public async handleMessage(sender: number, chat_id: string, body: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { history: true } })
      .then(async (chat) => {
        this.userService.findOne(sender).then(async (user) => {
          const message = new Message();
          message.sender_name = user.username;
          message.sender = sender;
          message.body = body;
          await this.messageRepository.save(message);
          chat.history.push(message);
          await this.chatRepository.save(chat);
        });
      });
  }

  public getTimeOfUnmute(days: number) {
    const date = new Date();
    const current_time = date.getTime();
    const new_time = current_time + days * 24 * 60 * 60 * 1000;
    date.setTime(new_time);
    return date;
  }

  public timeIsPassed(date: Date) {
    const current_date = new Date();
    return date < current_date;
  }

  public async isMute(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { muted: true } })
      .then(async (chat) => {
        let is_mute = false;
        chat.muted.forEach((mute) => {
          if (mute.intra_id === intra_id) {
            if (!this.timeIsPassed(mute.time_of_unmute)) is_mute = true;
          }
        });
        return is_mute;
      });
  }

  public async mute(chat_id: string, username: string, days: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { admins: true, muted: true } })
      .then(async (chat) => {
        const user = await this.userService.findOneByUsername(username);
        if (chat.owner == user.intra_id) return;
        if (chat.muted.some((mute) => mute.intra_id == user.intra_id)) return;

        const mute = new Mute();
        mute.intra_id = user.intra_id;
        mute.time_of_unmute = this.getTimeOfUnmute(days);
        await this.muteRepository.save(mute);
        chat.muted.push(mute);
        return await this.chatRepository.save(chat);
      });
  }

  public async isDirect(chat_id: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true } })
      .then(async (chat) => {
        if (chat.users.length === 2) return true;
        return false;
      });
  }

  public async getInfo(chat_id: string, intra_id: number) {
    const info = new Info();
    info.isAdmin = await this.isAdmin(chat_id, intra_id);
    info.isBanned = await this.isBanned(chat_id, intra_id);
    info.isMute = await this.isMute(chat_id, intra_id);
    info.isOwner = await this.isOwner(chat_id, intra_id);
    info.isProtected = await this.isProtected(chat_id);
    info.isUser = await this.isUser(chat_id, intra_id);
    info.isDirect = await this.isDirect(chat_id);
    return info;
  }

  public async isLocked(chat_id: string, intra_id: number) {
    console.log;
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: ['access_granted'] })
      .then(async (chat) => {
        if (
          chat.visibility == Visibility.PUBLIC ||
          chat.visibility == Visibility.PRIVATE
        ) {
          return false;
        }
        if (chat.visibility == Visibility.PROTECTED) {
          if (chat.access_granted.some((user) => user.intra_id == intra_id))
            return false;
        }
        return true;
      });
  }

  public async isPassword(chat_id: string, password: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: ['access_granted'] })
      .then(async (chat) => {
        try {
          if (await bcrypt.compare(password, chat.hashed_password)) {
            chat.access_granted.push(await this.userService.findOne(intra_id));
            return this.chatRepository.save(chat);
          }
        } catch (err) {
          console.log(err);
          throw new InternalServerErrorException('Comparing password failed');
        }
      });
  }

  public async changePassword(chat_id: string, password: string) {
    return this.chatRepository
      .findOne({ where: { chat_id } })
      .then(async (chat) => {
        chat.hashed_password = await this.hashPassword(password);
        this.chatRepository.save(chat);
      });
  }

  public async changeVisibility(
    chat_id: string,
    visibility: Visibility,
    password: string,
  ) {
    return this.chatRepository
      .findOne({ where: { chat_id } })
      .then(async (chat) => {
        chat.visibility = visibility;
        if (chat.visibility === Visibility.PROTECTED)
          chat.hashed_password = await this.hashPassword(password);
        this.chatRepository.save(chat);
      });
  }

  public async addToChannels(intra_id: number) {
    return this.chatRepository
      .findOne({ relations: ['visibility'] })
      .then(async (chat) => {
        if (
          chat.visibility == Visibility.PUBLIC ||
          chat.visibility == Visibility.PROTECTED
        ) {
          chat.users.push(await this.userService.findOne(intra_id));
          this.chatRepository.save(chat);
        }
      });
  }

  public async channels() {
    return this.chatRepository.find();
  }

  public async removeChat(chat: Chat) {
    chat.users = [];
    chat.history.forEach((message) => this.messageRepository.remove(message));
    chat.history = [];
    chat.admins = [];
    chat.banned = [];
    chat.muted = [];
    chat.access_granted = [];
    await this.chatRepository.save(chat);
    this.chatRepository.remove(chat);
  }

  public async leave(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({
        where: { chat_id },
        relations: {
          users: true,
          history: true,
          admins: true,
          banned: true,
          muted: true,
          access_granted: true,
        },
      })
      .then(async (chat) => {
        if (chat.owner == intra_id) {
          // console.log('removeChat called');
          this.removeChat(chat);
          return;
        }

        if (chat.admins.some((admin) => admin.intra_id == intra_id))
          chat.admins = chat.admins.filter((u) => u.intra_id !== intra_id);

        chat.users = chat.users.filter((u) => u.intra_id !== intra_id);

        this.chatRepository.save(chat);
      });
  }
}
