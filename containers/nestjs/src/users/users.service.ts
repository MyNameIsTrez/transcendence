import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Chat } from 'src/chat/chat.entity';
import { createReadStream } from 'fs';
import { AchievementsService } from './achievements.service';
import TransJwtService from '../auth/trans-jwt-service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly achievementsService: AchievementsService,
    private transJwtService: TransJwtService,
  ) {
    this.createFooUser();
  }

  // Adds a dummy user that is used to play against oneself during development
  async createFooUser() {
    const foo_intra_id = 42;

    if (!(await this.hasUser(foo_intra_id))) {
      this.create(foo_intra_id, 'foo', 'foo', 'foo@foo.foo');
    }
  }

  async create(
    intra_id: number,
    username: string,
    intra_name: string,
    email: string,
  ): Promise<User> {
    return this.usersRepository.save({
      intra_id,
      username,
      intra_name,
      email,
      lastOnline: new Date(),
      achievements: await this.achievementsService.create(),
    });
  }

  async getUser(intra_id: number) {
    const user = await this.usersRepository.findOne({
      where: { intra_id },
      relations: {
        achievements: true,
      },
    });

    return {
      intra_id: user.intra_id,
      username: user.username,
      wins: user.wins,
      losses: user.losses,
      lastOnline: user.lastOnline,
      isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
      achievements: user.achievements,
    };
  }

  async findOne(intra_id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ intra_id });
    if (!user) {
      throw new BadRequestException('No user with this intra_id exists');
    }
    return user;
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new BadRequestException('No user with this username exists');
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  hasUser(intra_id: number) {
    return this.usersRepository.existsBy({ intra_id });
  }

  async getUsername(intra_id: number): Promise<string> {
    console.log('getUsername');
    return this.findOne(intra_id).then((user) => {
      return user.username;
    });
  }

  async setUsername(intra_id: number, username: string) {
    const result = await this.usersRepository.update(
      { intra_id },
      { username: username },
    );
    if (result.affected === 0) {
      throw new BadRequestException('No user with this intra_id exists');
    }
  }

  set2faSecret(intra_id: number, secret: string) {
    this.usersRepository.update(
      { intra_id },
      { twoFactorAuthenticationSecret: secret },
    );
  }

  set2faState(intra_id: number, state: boolean, secret?: string) {
    // State doens't HAVE to be checked but it is nice to have this just in case someone locks themselfs out of their account some way
    if (state === true && !secret) {
      throw new BadRequestException("Can't enable 2fa without a secret");
    }
    this.usersRepository.update(
      { intra_id },
      {
        isTwoFactorAuthenticationEnabled: state,
        ...(state
          ? {}
          : {
              twoFactorAuthenticationSecret: null,
            }),
      },
    );
  }

  getMyChats(intra_id: number): Promise<Chat[]> {
    return this.usersRepository
      .findOne({
        where: { intra_id },
        relations: {
          chats: true,
        },
      })
      .then((user) => {
        return user?.chats;
      });
  }

  async turnOnTwoFactorAuthentication(intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      this.set2faState(intra_id, true, user.twoFactorAuthenticationSecret);
    }
  }

  async turnOffTwoFactorAuthentication(intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      this.set2faState(intra_id, false);
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      this.set2faSecret(intra_id, secret);
    }
  }

  getProfilePicture(intra_id: number) {
    const stream = createReadStream(
      `profile_pictures/${intra_id}.png`,
      'base64',
    );

    // If you add this line back, with nothing between the {},
    // it'll return 200 when the png doesn't exist
    // stream.on('error', () => {
    // TODO: Why does this not work?? It seems like the stream is catching it
    // throw new BadRequestException('foo');
    // });

    return new StreamableFile(stream);
  }

  async block(my_intra_id: number, other_intra_id: number) {
    const me = await this.usersRepository.findOne({
      where: { intra_id: my_intra_id },
      relations: {
        blocked: true,
      },
    });
    const other = await this.findOne(other_intra_id);

    me.blocked.push(other);

    return this.usersRepository.save(me);
  }

  async unblock(my_intra_id: number, other_intra_id: number) {
    const me = await this.usersRepository.findOne({
      where: { intra_id: my_intra_id },
      relations: {
        blocked: true,
      },
    });
    me.blocked = me.blocked.filter((user) => user.intra_id != other_intra_id);
    return this.usersRepository.save(me);
  }

  async iAmBlocked(my_intra_id: number, other_intra_id: number) {
    const other_user = await this.usersRepository.findOne({
      where: { intra_id: other_intra_id },
      relations: {
        blocked: true,
      },
    });
    return other_user.blocked.some((user) => user.intra_id == my_intra_id);
  }

  async addWin(intra_id: number) {
    await this.usersRepository.increment({ intra_id }, 'wins', 1);

    const wins = await this.getWins(intra_id);

    if (wins === 1 || wins === 100) {
      const achievements = await this.getAchievements(intra_id);

      if (wins === 1) {
        this.achievementsService.wonOnce(achievements.id);
      } else {
        this.achievementsService.wonOneHundredTimes(achievements.id);
      }
    }
  }

  async addLoss(intra_id: number) {
    await this.usersRepository.increment({ intra_id }, 'losses', 1);

    const losses = await this.getLosses(intra_id);

    if (losses === 1 || losses === 100) {
      const achievements = await this.getAchievements(intra_id);

      if (losses === 1) {
        this.achievementsService.lostOnce(achievements.id);
      } else {
        this.achievementsService.lostOneHundredTimes(achievements.id);
      }
    }
  }

  async getWins(intra_id: number) {
    return (await this.findOne(intra_id)).wins;
  }

  async getLosses(intra_id: number) {
    return (await this.findOne(intra_id)).losses;
  }

  async getAchievements(intra_id: number) {
    const user = await this.usersRepository.findOne({
      where: { intra_id },
      relations: {
        achievements: true,
      },
    });
    return user.achievements;
  }

  findOneByName(intra_name: string): Promise<User | null> {
    console.log('intra_name: ', intra_name);
    return this.usersRepository.findOneBy({ intra_name: intra_name });
  }

  async sendFriendRequest(
    sender_id: number,
    receiver_name: string,
  ): Promise<boolean> {
    const sender = await this.usersRepository.findOne({
      where: { intra_id: sender_id },
      relations: {
        friends: true,
        incoming_friend_requests: true,
      },
    });
    const receiver = await this.usersRepository.findOne({
      where: { intra_name: receiver_name },
      relations: {
        friends: true,
        incoming_friend_requests: true,
      },
    });
    if (!receiver) {
      throw new BadRequestException('User does not exist');
    }
    if (
      sender.friends.some((friend) => friend.intra_id === receiver.intra_id)
    ) {
      throw new BadRequestException('You are already friends with this user');
    }
    if (receiver.intra_id == sender_id) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }
    if (
      receiver.incoming_friend_requests.some(
        (friendRequest) => friendRequest.intra_id === sender_id,
      )
    ) {
      throw new BadRequestException('Friend request already sent');
    }
    if (
      sender.incoming_friend_requests.some(
        (friendRequest) => friendRequest.intra_id === receiver.intra_id,
      )
    ) {
      sender.friends.push(receiver);
      receiver.friends.push(sender);
      sender.incoming_friend_requests.splice(
        sender.incoming_friend_requests.findIndex(
          (user) => user.intra_id === receiver.intra_id,
        ),
        1,
      );
      this.usersRepository.save([sender, receiver]);
    } else {
      receiver.incoming_friend_requests.push(sender);
      this.usersRepository.save(receiver);
    }
    return true;
  }

  async getFriends(intra_id: number) {
    return await this.usersRepository
      .findOne({
        where: { intra_id },
        relations: {
          friends: true,
        },
      })
      .then(async (user) => {
        return await Promise.all(
          user.friends.map(async (friend) => {
            const nowMs = Date.now();
            const lastOnlineMs = (
              await this.getLastOnline(friend.intra_id)
            ).getTime();
            const isOnline = nowMs - lastOnlineMs < 10000;

            return {
              name: friend.username,
              isOnline,
              intraId: friend.intra_id,
            };
          }),
        );
      });
  }

  async getIncomingFriendRequests(intra_id: number) {
    const user = await this.usersRepository.findOne({
      where: { intra_id },
      relations: {
        incoming_friend_requests: true,
      },
    });
    if (user) {
      const incomingRequests = await Promise.all(
        user.incoming_friend_requests.map(async (incoming) => {
          console.log('incoming', incoming);
          const returned = {
            name: incoming.username,
            intraId: incoming.intra_id,
          };
          console.log('returned', returned);
          return returned;
        }),
      );
      console.log(incomingRequests);
      return incomingRequests;
    }
  }

  async acceptFriendRequest(receiver_id: number, sender_id: number) {
    const receiver = await this.usersRepository.findOne({
      where: { intra_id: receiver_id },
      relations: {
        incoming_friend_requests: true,
        friends: true,
      },
    });
    const sender = await this.usersRepository.findOne({
      where: { intra_id: sender_id },
      relations: {
        friends: true,
      },
    });
    console.log('incoming_fr', receiver.incoming_friend_requests);
    console.log(
      'index: ',
      receiver.incoming_friend_requests.findIndex(
        (user) => user.intra_id === sender_id,
      ),
    );
    sender.friends.push(receiver);
    receiver.friends.push(sender);
    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.findIndex(
        (user) => user.intra_id === sender_id,
      ),
      1,
    );
    this.usersRepository.save([sender, receiver]);
  }

  async declineFriendRequest(receiver_id: number, sender_id: number) {
    const receiver = await this.usersRepository.findOne({
      where: { intra_id: receiver_id },
      relations: {
        incoming_friend_requests: true,
      },
    });
    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.findIndex(
        (user) => user.intra_id === sender_id,
      ),
      1,
    );
    this.usersRepository.save(receiver);
  }

  async removeFriend(user_id: number, friend_id: number) {
    const user = await this.usersRepository.findOne({
      where: { intra_id: user_id },
      relations: {
        friends: true,
      },
    });
    const friend = await this.usersRepository.findOne({
      where: { intra_id: friend_id },
      relations: {
        friends: true,
      },
    });
    user.friends.splice(
      user.friends.findIndex((user) => user.intra_id === friend_id),
      1,
    );
    friend.friends.splice(
      friend.friends.findIndex((user) => user.intra_id === user_id),
      1,
    );
    this.usersRepository.save(user);
    this.usersRepository.save(friend);
  }

  updateLastOnline(intra_id: number) {
    this.usersRepository.update({ intra_id }, { lastOnline: new Date() });
  }

  getLastOnline(intra_id: number) {
    return this.findOne(intra_id).then((user) => {
      return user.lastOnline;
    });
  }
}
