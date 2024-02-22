import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  firstName!: string

  @Column()
  lastName!: string

  // TODO: Try removing this
  @Column({ default: true })
  isActive!: boolean
}
