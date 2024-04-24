import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { MyChat } from './mychat.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(MyChat)
    private readonly myChatRepository: Repository<MyChat>,
  ) {}

  create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(intra_id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ intra_id });
  }

  findOneByName(intra_name: string): Promise<User | null> {
    console.log('intra_name: ', intra_name);
    return this.usersRepository.findOneBy({ intra_name: intra_name });
  }

  updateIncomingFriendRequests(
    sender_id: number,
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
    const intraUser = await this.findOneByName(receiver_name);
    console.log('intra_user', intraUser);
    console.log('receiver_name', receiver_name);
    if (!intraUser) {
      throw new BadRequestException('User does not exist');
    }
    //TODO: misschien een mooiere manier vinden om dit te doen
    intraUser.incoming_friend_requests.push(sender_id);
    this.updateIncomingFriendRequests(
      sender_id,
      intraUser.intra_id,
      intraUser.incoming_friend_requests.filter(function (elem, index, self) {
        return index === self.indexOf(elem);
      }),
    );
    return true;
  }

  async remove(intra_id: number): Promise<void> {
    await this.usersRepository.delete(intra_id);
  }

  getUsername(intra_id: number): Promise<string> {
    return this.findOne(intra_id).then((user) => {
      return user?.username;
    });
  }

  setUsername(intra_id: number, username: string) {
    this.usersRepository.update({ intra_id }, { username: username });
  }

  async addToChat(intra_id: number, chat_id: string, name: string) {
    const myChat = new MyChat();
    myChat.chat_id = chat_id;
    myChat.name = name;
    myChat.user = await this.findOne(intra_id);
    await this.myChatRepository.save(myChat);
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
            profilePicture: //TODO: replace with actual pf
              'https://cdn.intra.42.fr/users/9a7a6d2e4ef5139c2bc8bb5271f7e3cc/sbos.jpg',
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
            profilePicture: //TODO: replace with actual pf
              'https://cdn.intra.42.fr/users/9a7a6d2e4ef5139c2bc8bb5271f7e3cc/sbos.jpg',
          };
		  console.log('returned', returned);
		  return returned;
        }),
      );
	  console.log(incomingRequests);
	  return incomingRequests;
    }
  }
}
