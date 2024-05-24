import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Creation {
  @PrimaryColumn('int')
  id: number;

  @CreateDateColumn()
  creationDate: Date;
}
