import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsSelect, Repository } from 'typeorm';
import { User } from './user.entity';
import { Chat, Visibility } from '../chat/chat.entity';
import { createReadStream } from 'fs';
import { AchievementsService } from './achievements.service';
import { ConfigService } from '@nestjs/config';
import UserSockets from './user.sockets';
import ChatSockets from '../chat/chat.sockets';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly achievementsService: AchievementsService,
    private readonly configService: ConfigService,
    private readonly userSockets: UserSockets,
    private readonly chatSockets: ChatSockets,
  ) {}

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

  async hasUser(intra_id: number) {
    return await this.usersRepository.existsBy({ intra_id });
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
        chats: {
          users: true,
        },
      },
      {
        chats: {
          chat_id: true,
          name: true,
          visibility: true,
        },
      },
    ).then((user) => {
      user?.chats.map((chat) => {
        if (chat.visibility === Visibility.DM) {
          chat.name = chat.users.find(
            (user) => user.intra_id !== intra_id,
          )?.username;
        }
      });
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

    try {
      await this.removeFriend(my_intra_id, other_intra_id);
    } catch (e) {}

    me.blocked.push(other);

    this.chatSockets.emitToClient(my_intra_id, 'blockedUser', other_intra_id);

    return await this.usersRepository.save(me);
  }

  async unblock(my_intra_id: number, other_intra_id: number) {
    const me = await this.findOne(my_intra_id, {
      blocked: true,
    });

    me.blocked = me.blocked.filter((user) => user.intra_id !== other_intra_id);

    this.chatSockets.emitToClient(my_intra_id, 'unblockedUser', other_intra_id);

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
    }).then((user) =>
      user.blocked.map((blockedUser) => this.getFrontendUser(blockedUser)),
    );
  }

  async addWin(intra_id: number) {
    await this.usersRepository.increment({ intra_id }, 'wins', 1);

    const wins = await this.getWins(intra_id);

    if (wins === 1 || wins === 100) {
      const achievements = await this.getAchievements(intra_id);

      if (wins === 1) {
        await this.achievementsService.wonOnce(achievements.id);
      } else {
        await this.achievementsService.wonOneHundredTimes(achievements.id);
      }
    }
  }

  async addLoss(intra_id: number) {
    await this.usersRepository.increment({ intra_id }, 'losses', 1);

    const losses = await this.getLosses(intra_id);

    if (losses === 1 || losses === 100) {
      const achievements = await this.getAchievements(intra_id);

      if (losses === 1) {
        await this.achievementsService.lostOnce(achievements.id);
      } else {
        await this.achievementsService.lostOneHundredTimes(achievements.id);
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

  async sendFriendRequest(sender_id: number, receiver_id: number) {
    const sender = await this.findOne(sender_id, {
      friends: true,
      incoming_friend_requests: true,
    });

    const receiver = await this.findOne(receiver_id, {
      friends: true,
      incoming_friend_requests: true,
      blocked: true,
    });
    if (!receiver) {
      throw new BadRequestException('No user with this receiver_name exists');
    }

    if (sender_id === receiver.intra_id) {
      throw new BadRequestException(
        "You can't send a friend request to yourself",
      );
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

    await this.unblock(sender_id, receiver.intra_id);

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
    }).then((user) =>
      user.friends.map((friend) => this.getFrontendUser(friend)),
    );
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

  async getOutgoingFriendRequests(intra_id: number) {
    const user = await this.findOne(intra_id, {
      outgoing_friend_requests: true,
    });
    if (user) {
      return user.outgoing_friend_requests.map((outgoing) => {
        return {
          intraId: outgoing.intra_id,
          name: outgoing.username,
        };
      });
    }
  }

  async acceptFriendRequest(receiver_id: number, sender_id: number) {
    const receiver = await this.findOne(receiver_id, {
      incoming_friend_requests: true,
      friends: true,
    });
    if (
      !receiver.incoming_friend_requests.some(
        (request) => request.intra_id === sender_id,
      )
    ) {
      throw new BadRequestException(
        "This person hasn't sent you a friend request",
      );
    }

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

    this.userSockets.emitToClient(
      receiver_id,
      'addFriend',
      this.getFrontendUser(sender),
    );
  }

  public async declineFriendRequest(receiver_id: number, sender_id: number) {
    // console.log('Entered declineFriendRequest', receiver_id, sender_id);
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

  public async revokeFriendRequest(user_id: number, other_id: number) {
    const user = await this.findOne(user_id, {
      friends: true,
      outgoing_friend_requests: true,
    });

    const myFriendIndex = user.friends.findIndex(
      (user) => user.intra_id === other_id,
    );
    if (myFriendIndex !== -1) {
      throw new BadRequestException(
        "You can't revoke a friend request once you're friends with the user",
      );
    }

    if (
      !user.outgoing_friend_requests.some((user) => user.intra_id === other_id)
    ) {
      throw new BadRequestException(
        "You don't have this user in your outgoing friend requests",
      );
    }

    return await this.declineFriendRequest(other_id, user_id);
  }

  public async removeFriend(user_id: number, friend_id: number) {
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
      throw new BadRequestException(
        "You don't have this user in your friends list",
      );
    }

    const otherFriendIndex = friend.friends.findIndex(
      (user) => user.intra_id === user_id,
    );
    if (otherFriendIndex === -1) {
      throw new BadRequestException(
        "The user doesn't have you in their friends list",
      );
    }

    user.friends.splice(myFriendIndex, 1);
    friend.friends.splice(otherFriendIndex, 1);

    await this.usersRepository.save(user);

    await this.usersRepository.save(friend);

    this.userSockets.emitToClient(friend_id, 'removeFriend', {
      intraId: user_id,
    });
  }

  public async updateLastOnline(intra_id: number) {
    await this.usersRepository.update({ intra_id }, { lastOnline: new Date() });
  }

  private getFrontendUser(user: User) {
    return {
      name: user.username,
      isOnline: this.isOnline(user),
      intraId: user.intra_id,
    };
  }

  private isOnline(user: User) {
    const nowMs = Date.now();
    const lastOnlineMs = user.lastOnline.getTime();
    return nowMs - lastOnlineMs < this.configService.get('OFFLINE_TIMEOUT_MS');
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

  public async getIntraId(intra_name: string) {
    const user = await this.usersRepository.findOne({
      where: { intra_name },
    });
    if (!user) {
      throw new BadRequestException('No user with this intra name exists');
    }
    return user.intra_id;
  }

  async getChatsOfUser(intra_id: number) {
    const user = await this.findOne(intra_id, {
      chats: true,
    });

    return user.chats;
  }
}
