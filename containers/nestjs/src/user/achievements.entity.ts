import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Achievements {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  wonOnce: boolean;

  @Column({ default: false })
  wonOneHundredTimes: boolean;

  @Column({ default: false })
  lostOnce: boolean;

  @Column({ default: false })
  lostOneHundredTimes: boolean;
}
