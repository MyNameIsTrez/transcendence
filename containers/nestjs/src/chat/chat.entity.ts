import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { Message } from './message.entity';
import { Mute } from './mute.entity';
import { User } from 'src/user/user.entity';

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
}

@Entity()
export class Chat {
  @PrimaryColumn('uuid')
  chat_id: string;

  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.chats)
  users: User[];

  @OneToMany(() => Message, (message) => message.chat)
  history: Message[];

  @Column({
    type: 'enum',
    enum: Visibility,
  })
  visibility: Visibility;

  @Column()
  hashed_password: string;

  @Column()
  owner: number; // TODO: Replace with User

  @ManyToMany(() => User, (user) => user.adminChats)
  admins: User[];

  @ManyToMany(() => User, (user) => user.bannedChats)
  banned: User[];

  @OneToMany(() => Mute, (mute) => mute.chat)
  muted: Mute[];

  @ManyToMany(() => User, (user) => user.accessGrantedChats)
  access_granted: User[];
}
