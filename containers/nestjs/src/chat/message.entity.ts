import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  sender: number;

  @Column()
  body: string;

  @ManyToOne(() => Chat, (chat) => chat.history)
  chat: Chat;
}
