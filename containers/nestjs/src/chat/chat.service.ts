import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
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
import ChatSockets from './chat.sockets';

class ChatClass {
  chat_id: string;
  name: string;
  visibility: Visibility;
}

class MyInfo {
  owner: boolean;
  admin: boolean;
  banned: boolean;
  muted: boolean;
}

type EditFields = {
  name?: string;
  password?: string;
  visibility?: Visibility;
};

type UserInfo = {
  intra_id: number;
  username: string;
  is_owner: boolean;
  is_admin: boolean;
  is_mute: boolean;
};

type BannedUserInfo = {
  intra_id: number;
  username: string;
  is_banned: boolean;
};

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Mute) private readonly muteRepository: Repository<Mute>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly chatSockets: ChatSockets,
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

    return await this.chatRepository.save({
      chat_id,
      name,
      users: [current_user],
      visibility: visibility,
      hashed_password,
      owner: current_user,
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

  public async myInfo(chat_id: string, intra_id: number): Promise<MyInfo> {
    return {
      owner: await this.isOwner(chat_id, intra_id),
      admin: await this.isAdmin(chat_id, intra_id),
      banned: await this.isBanned(chat_id, intra_id),
      muted: await this.isMuted(chat_id, intra_id),
    };
  }

  public async getUsers(
    chat_id: string,
    intra_id: number,
  ): Promise<UserInfo[]> {
    const chat = await this.getChat(
      { chat_id },
      { users: true, owner: true, admins: true, muted: true },
    );

    if (!chat.users.some((other) => other.intra_id === intra_id)) {
      throw new WsException('You are not a user of this chat');
    }

    const users = chat.users.map((user) => {
      return {
        intra_id: user.intra_id,
        username: user.username,
        is_owner: user.intra_id === chat.owner.intra_id,
        is_admin: chat.admins.some((other) => other.intra_id === user.intra_id),
        is_mute: chat.muted.some((mute) => {
          return (
            mute.intra_id === user.intra_id &&
            !this.hasTimePassed(mute.time_of_unmute)
          );
        }),
      };
    });

    users.sort((user1, user2) =>
      user1.is_owner ? -1 : +user2.is_admin - +user1.is_admin,
    );

    return users;
  }

  public async getBannedUsers(
    chat_id: string,
    intra_id: number,
  ): Promise<BannedUserInfo[]> {
    const chat = await this.getChat({ chat_id }, { users: true, admins: true, banned: true });

    if (!chat.admins.some((other) => other.intra_id === intra_id)) {
      throw new WsException('You are not an admin in this chat');
    }
    const bannedUsers = chat.banned.map((user) => {
      return {
        intra_id: user.intra_id,
        username: user.username,
        is_banned: chat.banned.some(
          (other) => other.intra_id === user.intra_id,
        ),
      };
    });

    return bannedUsers;
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

        this.chatSockets.emitToChat(chat_id, 'addUser', user);

        chat.users.push(user);
        await this.chatRepository.save(chat);
      },
    );
  }

  async openChat(chat_id: string, intra_id: number) {
    const user = await this.userService.findOne(intra_id);

    return this.getChat({ chat_id }, { users: true }).then(async (chat) => {
      if (!chat.users.some((other) => other.intra_id === user.intra_id)) {
        throw new WsException("You can't open a chat you haven't joined yet");
      }
    });
  }

  async openDM(invitedIntraId: number, intra_id: number) {
    if (invitedIntraId === intra_id) {
      throw new WsException("You can't start a chat with yourself");
    }

    const invited_user = await this.userService.findOne(invitedIntraId, {
      blocked: true,
    });

    const current_user = await this.userService.findOne(intra_id, {
      chats: { users: true },
    });

    let dm = current_user.chats.find(
      (chat) =>
        chat.visibility === Visibility.DM &&
        chat.users.some((user) => user.intra_id === invitedIntraId),
    );

    if (!dm) {
      if (invited_user.blocked.some((user) => user.intra_id === intra_id)) {
        throw new WsException('This user has blocked you');
      }

      dm = await this.chatRepository.save({
        chat_id: uuid(),
        name: 'placeholder',
        users: [current_user, invited_user],
        visibility: Visibility.DM,
        hashed_password: '',
        owner: current_user,
        admins: [current_user, invited_user],
      });
    }

    this.chatSockets.emitToClient(invitedIntraId, 'addMyChat', {
      chat_id: dm.chat_id,
      name: current_user.username,
      visibility: dm.visibility,
    });
    this.chatSockets.emitToClient(intra_id, 'addMyChat', {
      chat_id: dm.chat_id,
      name: invited_user.username,
      visibility: dm.visibility,
    });

    this.chatSockets.emitToClient(intra_id, 'openDM', {
      chat_id: dm.chat_id,
      name: invited_user.username,
      visibility: dm.visibility,
    });
  }

  async addAdmin(chat_id: string, adminner: number, adminned: number) {
    return this.getChat(
      { chat_id },
      { owner: true, users: true, admins: true },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (chat.owner.intra_id !== adminner) {
        throw new ForbiddenException('You are not the owner');
      }
      const user = chat.users.find((user) => user.intra_id === adminned);

      if (!user) {
        throw new BadRequestException("User isn't in this chat");
      }

      if (chat.admins.some((admin) => admin.intra_id === adminned)) {
        throw new ForbiddenException('This user is already admin');
      }

      chat.admins.push(user);
      await this.chatRepository.save(chat);

      this.chatSockets.emitToChat(chat_id, 'editUserInfo', {
        intra_id: adminned,
        is_admin: true,
      });
    });
  }

  async removeAdmin(chat_id: string, unAdminner: number, unAdminned: number) {
    return this.getChat(
      { chat_id },
      { owner: true, users: true, admins: true },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (chat.owner.intra_id !== unAdminner) {
        throw new ForbiddenException('You are not the owner');
      }

      if (chat.owner.intra_id === unAdminned) {
        throw new BadRequestException('Owner can not lose admin');
      }

      if (!chat.users.some((user) => user.intra_id === unAdminned)) {
        throw new BadRequestException("User isn't in this chat");
      }

      const index = chat.admins.findIndex(
        (admin) => admin.intra_id === unAdminned,
      );
      if (index === -1) {
        throw new ForbiddenException('This user is not an admin');
      }

      chat.admins.splice(index, 1);

      await this.chatRepository.save(chat);

      this.chatSockets.emitToChat(chat_id, 'editUserInfo', {
        intra_id: unAdminned,
        is_admin: false,
      });
    });
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

  public async banUser(chat_id: string, banned_id: number, banner_id: number) {
    return this.getChat(
      { chat_id },
      { users: true, banned: true, owner: true, admins: true },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (!chat.admins.some((admin) => admin.intra_id === banner_id)) {
        throw new ForbiddenException('You are not an admin');
      }

      if (!chat.users.some((user) => user.intra_id === banned_id)) {
        throw new BadRequestException("User isn't in this chat");
      }

      if (chat.banned.some((ban) => ban.intra_id === banned_id)) {
        throw new BadRequestException('User already banned');
      }

      if (chat.owner.intra_id === banned_id) {
        throw new ForbiddenException("Can't ban the owner");
      }

      if (
        chat.owner.intra_id !== banner_id &&
        chat.admins.some((admin) => admin.intra_id === banned_id)
      ) {
        throw new ForbiddenException("Can't ban another admin");
      }

      const user = await this.userService.findOne(banned_id);
      if (!user) {
        throw new BadRequestException("Couldn't fetch user from database");
      }

      chat.users = chat.users.filter((user) => user.intra_id !== banned_id);
      chat.admins = chat.admins.filter((user) => user.intra_id !== banned_id);
      chat.banned.push(user);

      await this.chatRepository.save(chat);

      this.chatSockets.removeUserFromChat(chat_id, banned_id);
      this.chatSockets.emitToChat(chat_id, 'removeUser', banned_id);
      this.chatSockets.emitToChat(chat_id, 'addBannedUser', user);
      this.chatSockets.emitToClient(banned_id, 'banned', {
        chat_id: chat_id,
        name: chat.name,
        visibility: chat.visibility,
      });
    });
  }

  public async unbanUser(chat_id: string, unbanned_id: number, unbanner_id: number) {
    return this.getChat(
      { chat_id },
      { users: true, banned: true, owner: true, admins: true },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (!chat.admins.some((admin) => admin.intra_id === unbanner_id)) {
        throw new ForbiddenException('You are not an admin');
      }

      if (!chat.banned.some((ban) => ban.intra_id === unbanned_id)) {
        throw new BadRequestException('User is not banned');
      }

      if (chat.owner.intra_id === unbanned_id) {
        throw new ForbiddenException("Can't unban the owner");
      }

      const user = await this.userService.findOne(unbanned_id);
      if (!user) {
        throw new BadRequestException("Couldn't fetch user from database");
      }

      chat.banned = chat.banned.filter((user) => user.intra_id !== unbanned_id);

      await this.chatRepository.save(chat);

      this.chatSockets.emitToChat(chat_id, 'removeUnbannedUser', unbanned_id);
    });
  }


  public async kickUser(chat_id: string, kicked_id: number, kicker_id: number) {
    return this.getChat(
      { chat_id },
      { users: true, owner: true, admins: true },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (!chat.admins.some((admin) => admin.intra_id === kicker_id)) {
        throw new ForbiddenException('You are not an admin');
      }

      if (!chat.users.some((user) => user.intra_id === kicked_id)) {
        throw new BadRequestException("User isn't in this chat");
      }

      if (chat.owner.intra_id === kicked_id) {
        throw new ForbiddenException("Can't kick the owner");
      }

      if (
        chat.owner.intra_id !== kicker_id &&
        chat.admins.some((admin) => admin.intra_id === kicked_id)
      ) {
        throw new ForbiddenException("Can't kick another admin");
      }

      chat.users = chat.users.filter((user) => user.intra_id !== kicked_id);
      chat.admins = chat.admins.filter((user) => user.intra_id !== kicked_id);

      await this.chatRepository.save(chat);

      this.chatSockets.removeUserFromChat(chat_id, kicked_id);
      this.chatSockets.emitToChat(chat_id, 'removeUser', kicked_id);
      this.chatSockets.emitToClient(kicked_id, 'kicked', {
        chat_id: chat_id,
        name: chat.name,
        visibility: chat.visibility,
      });
    });
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
    return this.getChat({ chat_id }, { owner: true }).then(async (chat) => {
      return chat.owner.intra_id === intra_id;
    });
  }

  public async isUser(chat_id: string, intra_id: number) {
    return this.getChat({ chat_id }, { users: true }).then(async (chat) => {
      return chat.users.some((user) => user.intra_id === intra_id);
    });
  }

  public async handleMessage(
    sender: number,
    chat_id: string,
    body: string,
    date: Date,
  ) {
    return await this.getChat({ chat_id }, { history: true }).then(
      async (chat) => {
        await this.userService.findOne(sender).then(async (user) => {
          const message = new Message();
          message.sender_name = user.username;
          message.sender = sender;
          message.body = body;
          message.date = date;
          await this.messageRepository.save(message);
          chat.history.push(message);
          await this.chatRepository.save(chat);
        });
      },
    );
  }

  public async isMuted(chat_id: string, intra_id: number) {
    return await this.getChat({ chat_id }, { muted: true }).then((chat) => {
      return chat.muted.some((mute) => {
        return (
          mute.intra_id === intra_id && !this.hasTimePassed(mute.time_of_unmute)
        );
      });
    });
  }

  private hasTimePassed(date: Date) {
    const current_date = new Date();
    return date < current_date;
  }

  public async mute(
    muter_id: number,
    chat_id: string,
    muted_id: number,
    endDate: Date,
  ) {
    return await this.getChat(
      { chat_id },
      { owner: true, admins: true, muted: true, users: true },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (!chat.admins.some((admin) => admin.intra_id === muter_id)) {
        throw new ForbiddenException('You are not an admin');
      }

      if (!chat.users.some((user) => user.intra_id === muted_id)) {
        throw new BadRequestException("User isn't in this chat");
      }

      if (chat.owner.intra_id === muted_id) {
        throw new ForbiddenException("Can't mute the owner");
      }

      if (
        chat.owner.intra_id !== muter_id &&
        chat.admins.some((admin) => admin.intra_id === muted_id)
      ) {
        throw new ForbiddenException("Can't mute another admin");
      }

      let mute = chat.muted.find((mute) => mute.intra_id === muted_id);
      if (mute) {
        mute.time_of_unmute = endDate;
      } else {
        mute = new Mute();
        mute.intra_id = muted_id;
        mute.time_of_unmute = endDate;
      }

      await this.muteRepository.save(mute);

      chat.muted.push(mute);

      await this.chatRepository.save(chat);

      this.chatSockets.emitToChat(chat_id, 'editUserInfo', {
        intra_id: muted_id,
        is_mute: true,
      });
    });
  }

  public async unmute(unmuter_id: number, chat_id: string, unmuted_id: number) {
    return await this.getChat(
      { chat_id },
      { owner: true, admins: true, muted: true, users: true },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (!chat.admins.some((admin) => admin.intra_id === unmuter_id)) {
        throw new ForbiddenException('You are not an admin');
      }

      if (!chat.users.some((user) => user.intra_id === unmuted_id)) {
        throw new BadRequestException("User isn't in this chat");
      }

      if (chat.owner.intra_id === unmuted_id) {
        throw new ForbiddenException("Can't unmute the owner");
      }

      if (
        chat.owner.intra_id !== unmuter_id &&
        chat.admins.some((admin) => admin.intra_id === unmuted_id)
      ) {
        throw new ForbiddenException("Can't unmute another admin");
      }

      const mute = chat.muted.find((mute) => mute.intra_id === unmuted_id);
      if (!mute) {
        throw new BadRequestException("This user isn't muted");
      }

      await this.muteRepository.delete(mute);

      this.chatSockets.emitToChat(chat_id, 'editUserInfo', {
        intra_id: unmuted_id,
        is_mute: false,
      });
    });
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

  public async removeChat(chat: Chat) {
    if (chat.visibility === Visibility.DM) {
      throw new ForbiddenException(
        "This action can't be performed in a direct message",
      );
    }

    chat.users = [];
    chat.history.forEach(
      async (message) => await this.messageRepository.remove(message),
    );
    chat.history = [];
    chat.admins = [];
    chat.banned = [];
    chat.muted = [];
    await this.chatRepository.save(chat);
    await this.chatRepository.remove(chat);
  }

  public async edit(
    chat_id: string,
    intra_id: number,
    edit_fields: EditFields,
  ) {
    return await this.getChat({ chat_id }, { owner: true }).then(
      async (chat) => {
        if (chat.visibility === Visibility.DM) {
          throw new ForbiddenException(
            "This action can't be performed in a direct message",
          );
        }

        if (intra_id !== chat.owner.intra_id) {
          throw new UnauthorizedException(
            'You are unauthorized to use this action',
          );
        }
        if (edit_fields.name !== undefined) {
          if (edit_fields.name === '') {
            throw new BadRequestException('Name cannot be empty');
          }
          chat.name = edit_fields.name;
        }

        if (edit_fields.visibility !== undefined) {
          if (
            chat.visibility !== Visibility.PROTECTED &&
            edit_fields.visibility === Visibility.PROTECTED &&
            edit_fields.password === undefined
          ) {
            throw new BadRequestException('Password cannot be empty');
          }
          if (
            edit_fields.visibility !== Visibility.PROTECTED &&
            edit_fields.password !== undefined
          ) {
            throw new BadRequestException(
              'Can only set a password for protected chats',
            );
          }
          chat.visibility = edit_fields.visibility;
          chat.hashed_password = '';
          if (edit_fields.password !== undefined) {
            if (edit_fields.password === '') {
              throw new BadRequestException('Password cannot be empty');
            }
            chat.hashed_password = await this.hashPassword(
              edit_fields.password,
            );
          }
        } else if (edit_fields.password !== undefined) {
          if (chat.visibility !== Visibility.PROTECTED) {
            throw new BadRequestException(
              'Can only set a password for protected chats',
            );
          }
          if (edit_fields.password === '') {
            throw new BadRequestException('Password cannot be empty');
          }
          chat.hashed_password = await this.hashPassword(edit_fields.password);
        }
        await this.chatRepository.save(chat);
        this.chatSockets.emitToAllSockets('editChatInfo', {
          chat_id: chat.chat_id,
          name: chat.name,
          visibility: chat.visibility,
        });
      },
    );
  }

  public async leave(chat_id: string, intra_id: number) {
    return await this.getChat(
      { chat_id },
      {
        users: true,
        history: true,
        owner: true,
        admins: true,
        banned: true,
        muted: true,
      },
    ).then(async (chat) => {
      if (chat.visibility === Visibility.DM) {
        throw new ForbiddenException(
          "This action can't be performed in a direct message",
        );
      }

      if (!chat.users.some((user) => user.intra_id === intra_id)) {
        throw new UnauthorizedException('You are not in this chat');
      }

      chat.admins = chat.admins.filter((admin) => admin.intra_id !== intra_id);
      chat.users = chat.users.filter((user) => user.intra_id !== intra_id);

      const sentChat: ChatClass = {
        chat_id: chat.chat_id,
        name: chat.name,
        visibility: chat.visibility,
      };

      this.chatSockets.removeUserFromChat(chat_id, intra_id);
      this.chatSockets.emitToClient(intra_id, 'leaveChat', sentChat);

      if (chat.owner.intra_id == intra_id) {
        if (chat.admins.length > 0) {
          chat.owner = chat.admins[0];
        } else if (chat.users.length > 0) {
          chat.owner = chat.users[0];
          chat.admins.push(chat.users[0]);
        } else {
          await this.removeChat(chat);
          this.chatSockets.emitToAllSockets('removeChat', chat_id);
          return;
        }
        this.chatSockets.emitToChat(chat_id, 'editUserInfo', {
          intra_id: chat.owner.intra_id,
          is_owner: true,
          is_admin: true,
        });
      }

      this.chatSockets.emitToChat(chat_id, 'removeUser', intra_id);

      await this.chatRepository.save(chat);
    });
  }
}
