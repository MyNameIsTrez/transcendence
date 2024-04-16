import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Message } from './message.entity';
import { Mute } from './mute.entity';

@Entity()
export class Chat {
  @PrimaryColumn('uuid')
  chat_id: string;

  @Column()
  name: string;

  @Column('int', { array: true })
  users: number[];

  @OneToMany(() => Message, (message) => message.chat)
  history: Message[];

  visibility: string;

  @Column()
  hashed_password: string;

  @Column()
  owner: number;

  @Column('int', { array: true })
  admins: number[];

  @Column('int', { array: true })
  banned: number[];

  @OneToMany(() => Mute, (mute) => mute.chat)
  muted: Mute[];
}
