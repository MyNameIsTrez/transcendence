import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  key!: number

  @Column()
  intra_id!: number

  @Column()
  displayname!: string

  @Column()
  image_url!: string
}
