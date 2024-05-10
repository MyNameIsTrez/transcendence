import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { MyChat } from './mychat.entity';

@Entity()
export class User {
  @PrimaryColumn('int')
  intra_id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  @Column({ nullable: true })
  twoFactorAuthenticationSecret: string | null;

  @OneToMany(() => MyChat, (my_chat) => my_chat.user)
  my_chats: MyChat[];

  @Column('int', { default: 0 })
  wins: number;

  @Column('int', { default: 0 })
  losses: number;
}
