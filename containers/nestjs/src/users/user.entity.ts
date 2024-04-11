import { Column, Entity, PrimaryColumn } from 'typeorm';

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

  @Column('uuid', { array: true })
  my_chats: string[];
}
