import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender_name: string;

  @Column('int')
  sender: number;

  @Column()
  body: string;

  @Column()
  date: Date;

  @ManyToOne(() => Chat, (chat) => chat.history)
  chat: Chat;
}
