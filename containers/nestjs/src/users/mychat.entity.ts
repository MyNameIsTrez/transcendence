import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class MyChat {
  @PrimaryColumn('uuid')
  chat_id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.my_chats)
  user: User;
}
