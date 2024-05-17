import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { MyChat } from './mychat.entity';
import { createReadStream } from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(MyChat)
    private readonly myChatRepository: Repository<MyChat>,
  ) {}

  create(
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
    });
  }

  // TODO: Remove?
  // findAll(): Promise<User[]> {
  //   return this.usersRepository.find();
  // }

  findOne(intra_id: number): Promise<User> {
    const user = this.usersRepository.findOneBy({ intra_id });
    if (!user) {
      throw new BadRequestException('No user with this intra_id exists');
    }
    return user;
  }

  hasUser(intra_id: number) {
    return this.usersRepository.existsBy({ intra_id });
  }

  getUsername(intra_id: number): Promise<string> {
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

  set2faState(intra_id: number, state: boolean, secret: string) {
    // State doens't HAVE to be checked but it is nice to have this just in case someone locks themselfs out of their account some way
    if (state == false && !secret) {
      throw new BadRequestException("Can't enable 2fa without a secret");
    }
    this.usersRepository.update(
      { intra_id },
      { isTwoFactorAuthenticationEnabled: state },
    );
  }

  async addToChat(intra_id: number, chat_id: string, name: string) {
    await this.myChatRepository.save({
      chat_id,
      name,
      user: await this.findOne(intra_id),
    });
  }

  getMyChats(intra_id: number): Promise<MyChat[]> {
    return this.usersRepository
      .findOne({
        where: { intra_id },
        relations: {
          my_chats: true,
        },
      })
      .then((user) => {
        return user?.my_chats;
      });
  }

  async turnOnTwoFactorAuthentication(intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      this.set2faState(intra_id, true, user.twoFactorAuthenticationSecret);
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

  async addWin(intra_id: number) {
    await this.usersRepository.increment({ intra_id }, 'wins', 1);
  }

  async addLoss(intra_id: number) {
    await this.usersRepository.increment({ intra_id }, 'losses', 1);
  }

  getWins(intra_id: number) {
    return this.findOne(intra_id).then((user) => {
      return user.wins;
    });
  }

  getLosses(intra_id: number) {
    return this.findOne(intra_id).then((user) => {
      return user.losses;
    });
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
        sender.incoming_friend_requests.indexOf(receiver),
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
    sender.friends.push(receiver);
    receiver.friends.push(sender);
    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.indexOf(sender),
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
    const sender = await this.findOne(sender_id);
    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.indexOf(sender),
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
    user.friends.splice(user.friends.indexOf(friend), 1);
    friend.friends.splice(friend.friends.indexOf(user), 1);
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
