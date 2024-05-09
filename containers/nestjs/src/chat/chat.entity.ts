import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Message } from './message.entity';
import { Mute } from './mute.entity';

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

  @Column('int', { array: true })
  users: number[];

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
  owner: number;

  @Column('int', { array: true })
  admins: number[];

  @Column('int', { array: true })
  banned: number[];

  @OneToMany(() => Mute, (mute) => mute.chat)
  muted: Mute[];
}
