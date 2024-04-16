import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

@Entity()
export class Mute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  intra_id: number;

  @Column('date')
  time_of_unmute: Date;

  @ManyToOne(() => Chat, (chat) => chat.history)
  chat: Chat;
}
