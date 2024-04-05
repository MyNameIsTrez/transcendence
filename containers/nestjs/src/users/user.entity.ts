import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  intra_id!: number;

  @Column()
  displayname!: string;

  @Column()
  email!: string;

  @Column()
  image_url!: string;
}
