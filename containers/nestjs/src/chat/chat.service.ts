import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Chat, Visibility } from './chat.entity';
import { Message } from './message.entity';
import { Mute } from './mute.entity';
import { UserService } from '../user/user.service';
import { WsException } from '@nestjs/websockets';

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
    });
  }

  public async getChat(
    where: FindOptionsWhere<Chat> | FindOptionsWhere<Chat>[],
    relations?: FindOptionsRelations<Chat>,
  ) {
    const chat = await this.chatRepository.findOne({
      where,
      relations: relations ?? {},
    });
    if (!chat) {
      throw new BadRequestException("Couldn't find chat");
    }
    return chat;
  }

  private async getChats(where: any, select: any) {
    const chats = await this.chatRepository.find({
      where,
      select,
    });
    return chats;
  }

  public async getPublicAndProtectedChats() {
    return [
      ...(await this.getPublicChats()),
      ...(await this.getProtectedChats()),
    ];
  }

  private async getPublicChats() {
    return await this.getChats(
      { visibility: Visibility.PUBLIC },
      {
        chat_id: true,
        name: true,
        visibility: true,
      },
    );
  }

  private async getProtectedChats() {
    return await this.getChats(
      { visibility: Visibility.PROTECTED },
      {
        chat_id: true,
        name: true,
        visibility: true,
      },
    );
  }

  async addUser(chat_id: string, intra_id: number) {
    const user = await this.userService.findOne(intra_id);

    return this.getChat({ chat_id }, { users: true, banned: true }).then(
      async (chat) => {
        if (chat.users.some((other) => other.intra_id === user.intra_id)) {
          throw new WsException("You're already in this chat");
        }
        if (chat.banned.some((banned) => banned.intra_id === user.intra_id)) {
          throw new WsException('You have been banned from this chat');
        }

        chat.users.push(user);
        await this.chatRepository.save(chat);
      },
    );
  }

  async openChat(chat_id: string, intra_id: number) {
    const user = await this.userService.findOne(intra_id);

    return this.getChat({ chat_id }, { users: true }).then(async (chat) => {
      if (!chat.users.some((other) => other.intra_id === user.intra_id)) {
        throw new WsException("You can't enter a chat you haven't joined yet");
      }
    });
  }

  async addAdmin(chat_id: string, intra_id: number) {
    // TODO: Don't allow adminning someone who isn't the owner
    return this.getChat({ chat_id }, { users: true, admins: true }).then(
      async (chat) => {
        chat.users.forEach(async (user) => {
          if (intra_id === user.intra_id) {
            chat.admins.push(user);
            await this.chatRepository.save(chat);
          }
        });
      },
    );
  }

  private hashPassword(password: string) {
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

  public async banUser(chat_id: string, intra_id: number) {
    // TODO: Don't allow us to ban someone, when we aren't an admin/owner
    // TODO: Don't allow us to ban the owner
    // TODO: Don't allow us to ban ourselves
    // TODO: Don't allow admins to ban other admins
    // TODO: DO allow the owner to ban admins
    // TODO: Don't call kickUser() from this method
    if (!(await this.kickUser(chat_id, intra_id))) return false;

    return this.getChat({ chat_id }, { users: true, banned: true }).then(
      async (chat) => {
        const user = await this.userService.findOne(intra_id);
        chat.banned.push(user);
        const result = await this.chatRepository.save(chat);
        return !!result;
      },
    );
  }

  public async kickUser(chat_id: string, intra_id: number) {
    // TODO: Don't allow us to kick someone, when we aren't an admin/owner
    // TODO: Don't allow us to kick the owner
    // TODO: Don't allow us to kick ourselves
    // TODO: Don't allow admins to kick other admins
    // TODO: DO allow the owner to kick admins
    return this.getChat({ chat_id }, { users: true, admins: true }).then(
      async (chat) => {
        const user = await this.userService.findOne(intra_id);
        if (chat.owner == user.intra_id) return false;

        chat.users = chat.users.filter((u) => u.intra_id !== user.intra_id);
        chat.admins = chat.admins.filter((u) => u.intra_id !== user.intra_id);
        const result = await this.chatRepository.save(chat);

        return !!result;
      },
    );
  }

  public async getName(chat_id: string) {
    return (await this.getChat({ chat_id })).name;
  }

  public async getHistory(chat_id: string) {
    return this.getChat({ chat_id }, { history: true }).then(async (chat) => {
      return chat.history;
    });
  }

  public async isAdmin(chat_id: string, intra_id: number) {
    return this.getChat({ chat_id }, { admins: true }).then(async (chat) => {
      return chat.admins.some((admin) => admin.intra_id === intra_id);
    });
  }

  public async isBanned(chat_id: string, intra_id: number) {
    return this.getChat({ chat_id }, { banned: true }).then(async (chat) => {
      return chat.banned.some((user) => user.intra_id == intra_id);
    });
  }

  public async isOwner(chat_id: string, intra_id: number) {
    return this.getChat({ chat_id }).then(async (chat) => {
      return chat.owner === intra_id;
    });
  }

  private async isProtected(chat_id: string) {
    return this.getChat({ chat_id }).then(async (chat) => {
      return chat.visibility === Visibility.PROTECTED;
    });
  }

  public async isUser(chat_id: string, intra_id: number) {
    return this.getChat({ chat_id }, { users: true }).then(async (chat) => {
      return chat.users.some((user) => user.intra_id === intra_id);
    });
  }

  public async handleMessage(sender: number, chat_id: string, body: string) {
    return this.getChat({ chat_id }, { history: true }).then(async (chat) => {
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

  private getTimeOfUnmute(days: number) {
    const date = new Date();
    const current_time = date.getTime();
    const new_time = current_time + days * 24 * 60 * 60 * 1000;
    date.setTime(new_time);
    return date;
  }

  private hasTimePassed(date: Date) {
    const current_date = new Date();
    return date < current_date;
  }

  public async isMute(chat_id: string, intra_id: number) {
    return this.getChat({ chat_id }, { muted: true }).then(async (chat) => {
      let is_mute = false;
      chat.muted.forEach((mute) => {
        if (mute.intra_id === intra_id) {
          if (!this.hasTimePassed(mute.time_of_unmute)) is_mute = true;
        }
      });
      return is_mute;
    });
  }

  public async mute(chat_id: string, intra_id: number, days: number) {
    // TODO: Remove "admins: true"?

    // TODO: Don't allow us to mute someone, when we aren't an admin/owner
    // TODO: Don't allow us to mute the owner
    // TODO: Don't allow us to mute ourselves
    // TODO: Don't allow admins to mute other admins
    // TODO: DO allow the owner to mute admins
    return this.getChat({ chat_id }, { admins: true, muted: true }).then(
      async (chat) => {
        const user = await this.userService.findOne(intra_id);
        if (chat.owner == user.intra_id) return;
        if (chat.muted.some((mute) => mute.intra_id == user.intra_id)) return;

        const mute = new Mute();
        mute.intra_id = user.intra_id;
        mute.time_of_unmute = this.getTimeOfUnmute(days);
        await this.muteRepository.save(mute);
        chat.muted.push(mute);
        return await this.chatRepository.save(chat);
      },
    );
  }

  private async isDirect(chat_id: string) {
    return this.getChat({ chat_id }, { users: true }).then(async (chat) => {
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
    return this.getChat({ chat_id }, { users: true }).then(async (chat) => {
      if (
        chat.visibility === Visibility.PUBLIC ||
        chat.visibility === Visibility.PRIVATE
      ) {
        return false;
      }
      if (chat.visibility == Visibility.PROTECTED) {
        if (chat.users.some((user) => user.intra_id === intra_id)) return false;
      }
      return true;
    });
  }

  public async isCorrectPassword(chat_id: string, password: string) {
    return await this.getChat({ chat_id }, { users: true }).then(
      async (chat) => {
        return await bcrypt.compare(password, chat.hashed_password);
      },
    );
  }

  public async changePassword(chat_id: string, password: string) {
    // TODO: Throw if we aren't the owner of the chat

    return this.getChat({ chat_id }).then(async (chat) => {
      chat.hashed_password = await this.hashPassword(password);
      this.chatRepository.save(chat);
    });
  }

  public async changeVisibility(
    chat_id: string,
    visibility: Visibility,
    password: string,
  ) {
    return this.getChat({ chat_id }).then(async (chat) => {
      chat.visibility = visibility;
      if (chat.visibility === Visibility.PROTECTED)
        chat.hashed_password = await this.hashPassword(password);
      this.chatRepository.save(chat);
    });
  }

  public async removeChat(chat: Chat) {
    chat.users = [];
    chat.history.forEach((message) => this.messageRepository.remove(message));
    chat.history = [];
    chat.admins = [];
    chat.banned = [];
    chat.muted = [];
    await this.chatRepository.save(chat);
    this.chatRepository.remove(chat);
  }

  public async leave(chat_id: string, intra_id: number) {
    return this.getChat(
      { chat_id },
      {
        users: true,
        history: true,
        admins: true,
        banned: true,
        muted: true,
      },
    ).then(async (chat) => {
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
