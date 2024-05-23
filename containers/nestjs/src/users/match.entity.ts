import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.matchHistory)
  leftPlayer: User;

  @ManyToMany(() => User, (user) => user.matchHistory)
  rightPlayer: User;

  @Column('int')
  leftScore: number;

  @Column('int')
  rightScore: number;
}
