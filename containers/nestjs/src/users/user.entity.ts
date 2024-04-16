import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { MyChat } from './mychat.entity';

@Entity()
export class User {
  @PrimaryColumn('int')
  intra_id: number;

  @Column()
  displayname: string;

  @Column()
  email: string;

  @Column()
  image_url: string;

  @OneToMany(() => MyChat, (my_chat) => my_chat.user)
  my_chats: MyChat[];
}
