import { Column, Entity, ManyToMany, JoinTable, OneToMany, PrimaryColumn } from 'typeorm';
// import { MyChat } from './mychat.entity';
import { Chat } from 'src/chat/chat.entity';

@Entity()
export class User {
  @PrimaryColumn('int')
  intra_id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  isTwoFactorAuthenticationEnabled: boolean;

  @Column({ nullable: true })
  twoFactorAuthenticationSecret: string | null;

  @ManyToMany(() => Chat, (chat) => chat.users)
  @JoinTable()
  chats: Chat[];

  @ManyToMany(() => Chat, (chat) => chat.admins)
  @JoinTable()
  adminChats: Chat[];

  @ManyToMany(() => Chat, (chat) => chat.banned)
  @JoinTable()
  bannedChats: Chat[];
}
