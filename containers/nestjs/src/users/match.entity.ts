import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.matchHistory)
  players: User[];

  @OneToOne(() => User)
  @JoinColumn()
  disconnectedPlayer: User | null;

  @Column('int')
  leftScore: number;

  @Column('int')
  rightScore: number;
}
