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

class Info {
  isAdmin: boolean;
  isDirect: boolean;
  isMute: boolean;
  isOwner: boolean;
  isProtected: boolean;
}

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
      .then(async (chat) => {
        chat.users = [...chat.users, user]
        chat.number_of_users += 1
        await this.chatRepository.save(chat)
      })
  }

  async addAdmin(chat_id: string, username: string) {
    let user = await this.usersService.findOneByUsername(username);
    if (!user)
      return
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, admins: true } })
      .then(async (chat) => {
        chat.users.forEach(async user => {
          if (username == user.username) {
            chat.admins = [...chat.admins, user]
            await this.chatRepository.save(chat)
          }
        });
      })
  }

  public hashPassword(password: string) {
    const rounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS'))
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
    if (await this.kickUser(chat_id, username) == false)
      return false
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, banned: true } })
      .then(async (chat) => {
        const user = await this.usersService.findOneByUsername(username)
        if (!user) { return false }

        chat.banned = [...chat.banned, user]
        let result = await this.chatRepository.save(chat)
            if (result)
              return true
        });
    }

  public async kickUser(chat_id: string, username: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true, admins: true } })
      .then(async (chat) => {
        let stop = false

        const user = await this.usersService.findOneByUsername(username)
        if (!user) { return false }
        
        const admins = [...chat.admins]
        admins.forEach(admin => {
          if (admin.intra_id === user.intra_id) { stop = true }
        })
        if (stop)
          return false
        chat.users = chat.users.filter(u => u.intra_id !== user.intra_id);
        chat.number_of_users -= 1
        let result = await this.chatRepository.save(chat)
        if (result)
          return true
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

  public async getHistory(chat_id: string) {
    return this.chatRepository
    .findOne({ where: { chat_id }, relations: { history: true } })
    .then(async (chat) => {
      return chat.history
    });
  }

  public async isAdmin(chat_id: string, intra_id: number) {
    return this.chatRepository
    .findOne({ where: { chat_id }, relations: { admins: true } })
    .then(async (chat) => {
      let isAdmin = false
      const admins = chat.admins
      admins.forEach(admin => {
        if (admin.intra_id == intra_id)
          isAdmin = true
      })
      return isAdmin
    });
  }

  public async isOwner(chat_id: string, intra_id: number) {
    return this.chatRepository
    .findOne({ where: { chat_id } })
    .then(async (chat) => {
      if (chat.owner == intra_id)
        return true
      return false
    });
  }

  public async isDirect(chat_id: string) {
    return this.chatRepository
    .findOne({ where: { chat_id } })
    .then(async (chat) => {
      if (chat.number_of_users === 2)
        return true
      return false
    });
  }

  public async isProtected(chat_id: string) {
    return this.chatRepository
    .findOne({ where: { chat_id } })
    .then(async (chat) => {
      if (chat.visibility === Visibility.PROTECTED)
        return true
      return false
    });
  }

  public async handleMessage(sender: number, chat_id: string, body: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { history: true } })
      .then(async (chat) => {

        this.usersService.findOne(sender)
          .then(async(user) => {
            
            const message = new Message();
            message.sender_name = user.username
            message.sender = sender;
            message.body = body;
            await this.messageRepository.save(message);
    
            chat.history = [...chat.history, message]
            await this.chatRepository.save(chat)

          })

      });
  }

  public async getOtherIntraId(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { users: true } })
      .then(async (chat) => {

        let user_id = 0
        const users = [...chat.users]
        users.forEach(user => {
          if (user.intra_id != intra_id)
            user_id = user.intra_id
        });
        return user_id
    })
  }

  public getTimeOfUnmute(days: number) {
    let date = new Date()
    const current_time = date.getTime()
    const new_time = current_time + (days * 24 * 60 * 60 * 1000)
    date.setTime(new_time)
    return date
  }

  public timeIsPassed(date: Date) {
    let current_date = new Date()
    return date < current_date
  }

  public async isMute(chat_id: string, intra_id: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { muted: true } })
      .then(async (chat) => {

        let is_mute = false
        const muted = [...chat.muted]
        muted.forEach(mute => {
          if (mute.intra_id == intra_id) {
            if (!this.timeIsPassed(mute.time_of_unmute))
              is_mute = true
            }
        })
        return is_mute
      })
  }

  public async mute(chat_id: string, username: string, days: number) {
    return this.chatRepository
      .findOne({ where: { chat_id }, relations: { muted: true } })
      .then(async (chat) => {

        const user = await this.usersService.findOneByUsername(username)
        if (!user) { return false }

        const mute = new Mute()
        mute.intra_id = user.intra_id
        mute.time_of_unmute = this.getTimeOfUnmute(days)
        await this.muteRepository.save(mute)
        chat.muted = [...chat.muted, mute]
        return await this.chatRepository.save(chat)
      })
  }

  public async getInfo(chat_id: string, intra_id: number) {
    const info = new Info()
    info.isAdmin = await this.isAdmin(chat_id, intra_id);
    info.isDirect = await this.isDirect(chat_id);
    info.isMute = await this.isMute(chat_id, intra_id);
    info.isOwner = await this.isOwner(chat_id, intra_id);
    info.isProtected = await this.isProtected(chat_id);
    return info
  }

  public async isLocked(chat_id: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }})
      .then(async (chat) => {
        if (chat.visibility == Visibility.PROTECTED)
          return true;
        return false
      })
  }

  public async isPassword(chat_id: string, password: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }})
      .then(async (chat) => {
        try {
          return await bcrypt.compare(password, chat.hashed_password)
        }
        catch (err) {
          console.log(err)
          throw new InternalServerErrorException('Comparing password failed');
        }
      })
  }

  public async changePassword(chat_id: string, password: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }})
      .then(async (chat) => {
        chat.hashed_password = await this.hashPassword(password)
        this.chatRepository.save(chat)
      })
  }

  public async changeVisibility(chat_id: string, visibility: Visibility, password: string) {
    return this.chatRepository
      .findOne({ where: { chat_id }})
      .then(async (chat) => {
        chat.visibility = visibility
        if (chat.visibility == Visibility.PROTECTED)
          chat.hashed_password = await this.hashPassword(password)
        this.chatRepository.save(chat)
      })
  }
}
