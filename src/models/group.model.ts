import * as mongoose from 'mongoose';
import { User } from './user.model';

export const GroupSchema = new mongoose.Schema({
  name: String,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

export interface Group extends mongoose.Document {
  name: string;
  users: mongoose.Document[];
}
