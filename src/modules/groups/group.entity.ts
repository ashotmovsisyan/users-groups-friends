import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Group {
  @ObjectIdColumn()
  _id: string;
  @Column()
  name: string;
  @Column()
  users: User[];
}
