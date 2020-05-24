import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm';
import { Group } from '../groups/group.entity';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  friends: User[];

  @Column()
  groups: Group[];
}
