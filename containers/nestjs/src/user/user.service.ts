import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsSelect, Repository } from 'typeorm';
import { User } from './user.entity';
import { Chat } from 'src/chat/chat.entity';
import { createReadStream } from 'fs';
import { AchievementsService } from './achievements.service';
import { ConfigService } from '@nestjs/config';
import UserSockets from './user.sockets';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly achievementsService: AchievementsService,
    private readonly configService: ConfigService,
    private readonly userSockets: UserSockets,
  ) {
    if (this.configService.get('VITE_ALLOW_DEBUG_USER')) {
      this.createFooUser();
    }
  }

  // Adds a dummy user that is used to play against oneself during development
  async createFooUser() {
    const foo_intra_id = 42;
    if (!(await this.hasUser(foo_intra_id))) {
      await this.create(foo_intra_id, 'foo', 'foo', 'foo@foo.foo');
    }
  }

  async create(
    intra_id: number,
    username: string,
    intra_name: string,
    email: string,
  ): Promise<User> {
    return await this.usersRepository.save({
      intra_id,
      username,
      intra_name,
      email,
      lastOnline: new Date(),
      achievements: await this.achievementsService.create(),
    });
  }

  async getUser(intra_id: number) {
    const user = await this.findOne(intra_id, {
      achievements: true,
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

  async getLeaderboard() {
    const users = await this.usersRepository.find();

    const allow_debug_user = this.configService.get('VITE_ALLOW_DEBUG_USER');

    return users
      .filter((user) => user.intra_id !== 42 || allow_debug_user)
      .map((user) => {
        return {
          name: user.username,
          intraId: user.intra_id,
          wins: user.wins,
          losses: user.losses,
        };
      })
      .sort((a, b) => b.wins - a.wins);
  }

  async findOne(
    intra_id: number,
    relations?: FindOptionsRelations<User>,
    select?: FindOptionsSelect<User>,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { intra_id },
      relations: relations ?? {},
      select: select ?? {},
    });
    if (!user) {
      throw new BadRequestException('No user with this intra_id exists');
    }
    return user;
  }

  hasUser(intra_id: number) {
    return this.usersRepository.existsBy({ intra_id });
  }

  async getUsername(intra_id: number): Promise<string> {
    return await this.findOne(intra_id).then((user) => {
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

  async set2faSecret(intra_id: number, secret: string) {
    await this.usersRepository.update(
      { intra_id },
      { twoFactorAuthenticationSecret: secret },
    );
  }

  async set2faState(intra_id: number, state: boolean, secret?: string) {
    // State doens't HAVE to be checked but it is nice to have this just in case someone locks themselfs out of their account some way
    if (state === true && !secret) {
      throw new BadRequestException("Can't enable 2fa without a secret");
    }
    await this.usersRepository.update(
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

  public async myChats(intra_id: number): Promise<Chat[]> {
    return this.findOne(
      intra_id,
      {
        chats: true,
      },
      {
        chats: {
          chat_id: true,
          name: true,
          visibility: true,
        },
      },
    ).then((user) => {
      return user?.chats;
    });
  }

  async turnOnTwoFactorAuthentication(intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      await this.set2faState(
        intra_id,
        true,
        user.twoFactorAuthenticationSecret,
      );
    }
  }

  async turnOffTwoFactorAuthentication(intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      await this.set2faState(intra_id, false);
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      await this.set2faSecret(intra_id, secret);
    }
  }

  getProfilePicture(intra_id: number) {
    const stream = createReadStream(`profile_pictures/${intra_id}`, 'base64');

    // If you add this line back, with nothing between the {},
    // it'll return 200 when the png doesn't exist
    // stream.on('error', () => {
    // TODO: Why does this not work?? It seems like the stream is catching it
    // throw new BadRequestException('foo');
    // });

    return new StreamableFile(stream);
  }

  async block(my_intra_id: number, other_intra_id: number) {
    if (my_intra_id === other_intra_id) {
      throw new BadRequestException("You can't block yourself");
    }

    const me = await this.findOne(my_intra_id, {
      blocked: true,
    });
    const other = await this.findOne(other_intra_id);
    if (me.intra_id == other_intra_id) return;

    await this.removeFriend(my_intra_id, other_intra_id);

    me.blocked.push(other);

    return await this.usersRepository.save(me);
  }

  async unblock(my_intra_id: number, other_intra_id: number) {
    const me = await this.findOne(my_intra_id, {
      blocked: true,
    });

    me.blocked = me.blocked.filter((user) => user.intra_id !== other_intra_id);

    return await this.usersRepository.save(me);
  }

  async hasBlocked(my_intra_id: number, other_intra_id: number) {
    const me = await this.findOne(my_intra_id, {
      blocked: true,
    });

    const blocked = me.blocked.some((user) => user.intra_id === other_intra_id);

    return blocked;
  }

  async blocked(intra_id: number) {
    return await this.findOne(intra_id, {
      blocked: true,
    }).then(async (user) => {
      return await Promise.all(
        user.blocked.map(async (blockedUser) => {
          const nowMs = Date.now();
          const lastOnlineMs = (
            await this.getLastOnline(blockedUser.intra_id)
          ).getTime();
          const isOnline =
            nowMs - lastOnlineMs < this.configService.get('OFFLINE_TIMEOUT_MS');

          return {
            name: blockedUser.username,
            isOnline,
            intraId: blockedUser.intra_id,
          };
        }),
      );
    });
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
    const user = await this.findOne(intra_id, {
      achievements: true,
    });
    return user.achievements;
  }

  async sendFriendRequest(sender_id: number, receiver_name: string) {
    const sender = await this.findOne(sender_id, {
      friends: true,
      incoming_friend_requests: true,
    });

    const receiver = await this.usersRepository.findOne({
      where: { intra_name: receiver_name },
      relations: {
        friends: true,
        incoming_friend_requests: true,
        blocked: true,
      },
    });
    if (!receiver) {
      throw new BadRequestException('No user with this receiver_name exists');
    }

    if (!receiver) {
      throw new BadRequestException('User does not exist');
    }

    if (
      sender.friends.some((friend) => friend.intra_id === receiver.intra_id)
    ) {
      throw new BadRequestException('You are already friends with this user');
    }

    if (receiver.intra_id === sender_id) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }

    if (
      receiver.incoming_friend_requests.some(
        (friendRequest) => friendRequest.intra_id === sender_id,
      )
    ) {
      throw new BadRequestException('Friend request already sent');
    }

    if (receiver.blocked.some((block) => block.intra_id === sender_id)) {
      throw new BadRequestException(
        "Can't befriend someone who has blocked you",
      );
    }

    this.unblock(sender_id, receiver.intra_id);

    // If we were already invited by this person, immediately make us friends
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

      await this.usersRepository.save([sender, receiver]);
    } else {
      receiver.incoming_friend_requests.push(sender);
      await this.usersRepository.save(receiver);

      const receiverSockets = this.userSockets.get(receiver.intra_id);

      if (!receiverSockets) {
        throw new BadRequestException(
          'Failed to get the sockets of the receiver',
        );
      }

      receiverSockets.forEach((receiverSocket) =>
        receiverSocket.emit('newIncomingFriendRequest', {
          intraId: sender_id,
          name: sender.username,
        }),
      );
    }
  }

  async getFriends(intra_id: number) {
    return await this.findOne(intra_id, {
      friends: true,
    }).then(async (user) => {
      return await Promise.all(
        user.friends.map(async (friend) => {
          const nowMs = Date.now();
          const lastOnlineMs = (
            await this.getLastOnline(friend.intra_id)
          ).getTime();
          const isOnline =
            nowMs - lastOnlineMs < this.configService.get('OFFLINE_TIMEOUT_MS');

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
    const user = await this.findOne(intra_id, {
      incoming_friend_requests: true,
    });
    if (user) {
      return user.incoming_friend_requests.map((incoming) => {
        return {
          intraId: incoming.intra_id,
          name: incoming.username,
        };
      });
    }
  }

  async acceptFriendRequest(receiver_id: number, sender_id: number) {
    const receiver = await this.findOne(receiver_id, {
      incoming_friend_requests: true,
      friends: true,
    });
    const sender = await this.findOne(sender_id, {
      friends: true,
    });
    sender.friends.push(receiver);
    receiver.friends.push(sender);
    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.findIndex(
        (user) => user.intra_id === sender_id,
      ),
      1,
    );
    await this.usersRepository.save([sender, receiver]);
  }

  async declineFriendRequest(receiver_id: number, sender_id: number) {
    console.log('Entered declineFriendRequest', receiver_id, sender_id);
    const receiver = await this.findOne(receiver_id, {
      incoming_friend_requests: true,
    });
    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.findIndex(
        (user) => user.intra_id === sender_id,
      ),
      1,
    );
    await this.usersRepository.save(receiver);
  }

  async removeFriend(user_id: number, friend_id: number) {
    const user = await this.findOne(user_id, {
      friends: true,
    });
    const friend = await this.findOne(friend_id, {
      friends: true,
    });

    const myFriendIndex = user.friends.findIndex(
      (user) => user.intra_id === friend_id,
    );
    if (myFriendIndex === -1) {
      return;
    }

    const otherFriendIndex = friend.friends.findIndex(
      (user) => user.intra_id === user_id,
    );
    if (otherFriendIndex === -1) {
      return;
    }

    user.friends.splice(myFriendIndex, 1);
    friend.friends.splice(otherFriendIndex, 1);

    await this.usersRepository.save(user);

    await this.usersRepository.save(friend);
  }

  public async updateLastOnline(intra_id: number) {
    await this.usersRepository.update({ intra_id }, { lastOnline: new Date() });
  }

  private async getLastOnline(intra_id: number) {
    return await this.findOne(intra_id).then((user) => {
      return user.lastOnline;
    });
  }

  public async getMatchHistory(intra_id: number) {
    return await this.findOne(intra_id, {
      matchHistory: {
        players: true,
        disconnectedPlayer: true,
      },
    }).then((user) => {
      return user?.matchHistory;
    });
  }

  async getChatsOfUser(intra_id: number) {
    const user = await this.findOne(intra_id, {
      chats: true,
    });

    return user.chats;
  }
}
