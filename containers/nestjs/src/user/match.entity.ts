import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum Gamemode {
  NORMAL = 'normal',
  SPECIAL = 'special',
}

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.matchHistory)
  players: User[];

  @ManyToOne(() => User)
  disconnectedPlayer: User | null;

  @Column('int')
  leftScore: number;

  @Column('int')
  rightScore: number;

  @Column({
    type: 'enum',
    enum: Gamemode,
  })
  gamemode: Gamemode;
}
