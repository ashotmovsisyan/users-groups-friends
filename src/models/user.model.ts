import * as mongoose from 'mongoose';
import { Group } from './group.model';

export const UserSchema = new mongoose.Schema({
  name: String,
  age: Number,
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
});

export interface User extends mongoose.Document {
  id: string;
  name: string;
  age: number;
  friends: mongoose.Document[];
  groups: mongoose.Document[];
}
