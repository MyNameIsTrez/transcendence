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

  create(intra_id: number, username: string, intra_name: string, email: string): Promise<User> {
    return this.usersRepository.save({
      intra_id,
      username,
	  intra_name,
      email,
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

  // TODO: Remove?
  // async remove(intra_id: number): Promise<void> {
  //   await this.usersRepository.delete(intra_id);
  // }

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

  updateIncomingFriendRequests(
    sender_id: number, //TODO: kijken of dit weg kan
    receiver_id: number,
    incoming_friend_requests,
  ) {
    this.usersRepository.update(
      { intra_id: receiver_id },
      { incoming_friend_requests },
    );
  }

  async sendFriendRequest(
    sender_id: number,
    receiver_name: string,
  ): Promise<Boolean> {
    const sender = await this.findOne(sender_id);
    const receiver = await this.findOneByName(receiver_name);
    console.log('intra_user', receiver);
    console.log('receiver_name', receiver_name);
    if (!receiver) {
      throw new BadRequestException('User does not exist');
    }
    if (sender.friends.includes(receiver.intra_id)) {
      throw new BadRequestException('You are already friends with this user'); //TODO: vragen of dit de juiste exception is
    }
    if (receiver.intra_id == sender_id) {
      throw new BadRequestException('You cannot add yourself as a friend');
    }
    if (receiver.incoming_friend_requests.includes(sender_id)) {
      throw new BadRequestException('Friend request already sent');
    }
    //TODO: misschien een mooiere manier vinden om dit te doen
    receiver.incoming_friend_requests.push(sender_id);
    this.updateIncomingFriendRequests(
      sender_id,
      receiver.intra_id,
      receiver.incoming_friend_requests.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );
    return true;
  }

  async getFriends(intra_id: number) {
    const user = await this.findOne(intra_id);
    console.log('user', user);
    if (user) {
      const friends = await Promise.all(
        user.friends.map(async (friend_id) => {
          console.log('lmao');
          const friend = await this.findOne(friend_id);
          console.log('friend', friend);
          const returned = {
            name: friend.username,
            isOnline: true, // TODO: Store this in the user!
            intraId: friend.intra_id,
          };
          console.log('returned', returned);
          return returned;
        }),
      );
      console.log(friends);
      return friends;
    }
  }

  async getIncomingFriendRequests(intra_id: number) {
    const user = await this.findOne(intra_id);
    if (user) {
      const incomingRequests = await Promise.all(
        user.incoming_friend_requests.map(async (incoming_id) => {
          const incoming = await this.findOne(incoming_id);
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

  updateFriends(user_id: number, friends) {
    this.usersRepository.update({ intra_id: user_id }, { friends });
  }

  async acceptFriendRequest(receiver_id: number, sender_id: number) {
    const receiver = await this.findOne(receiver_id);
    const sender = await this.findOne(sender_id);
    console.log('SENDER ID: ', sender_id);
    console.log('aFR receiver: ', receiver);
    console.log('aFR sender: ', sender);

    sender.friends.push(receiver_id);
    this.updateFriends(
      sender.intra_id,
      sender.friends.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );

    receiver.friends.push(sender_id);
    this.updateFriends(
      receiver.intra_id,
      receiver.friends.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );

    console.log('MILAN INCOMING: ', receiver.incoming_friend_requests);
    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.indexOf(sender_id),
      1,
    );
    console.log('MILAN INCOMING: ', receiver.incoming_friend_requests);
    this.updateIncomingFriendRequests(
      sender_id,
      receiver.intra_id,
      receiver.incoming_friend_requests.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );
    console.log('aFR user', receiver);
  }

  async declineFriendRequest(receiver_id: number, sender_id: number) {
    const receiver = await this.findOne(receiver_id);
    const sender = await this.findOne(sender_id);
    console.log('SENDER ID: ', sender_id);
    console.log('dFR receiver: ', receiver);
    console.log('dFR sender: ', sender);

    receiver.incoming_friend_requests.splice(
      receiver.incoming_friend_requests.indexOf(sender_id),
      1,
    );
    this.updateIncomingFriendRequests(
      sender_id,
      receiver.intra_id,
      receiver.incoming_friend_requests.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );
    console.log('dFR user', receiver);
  }

  async removeFriend(user_id: number, friend_id: number) {
    const user = await this.findOne(user_id);
    const friend = await this.findOne(friend_id);
    console.log('user ID: ', user_id);
    console.log('rF user: ', user);
    console.log('rF friend: ', friend);

    user.friends.splice(user.friends.indexOf(friend_id), 1);
    this.updateFriends(
      user.intra_id,
      user.friends.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );

    friend.friends.splice(friend.friends.indexOf(user_id), 1);
    this.updateFriends(
      friend.intra_id,
      friend.friends.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );
  }
}
