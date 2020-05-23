import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../models/user.model';
import { Group } from '../../models/group.model';
import { UserCreateDto } from '../../dto/user-create.dto';
import { UserUpdateDto } from '../../dto/user-update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Group')
    private groupsModel: Model<Group>,
    @InjectModel('User')
    private usersModel: Model<User>,
  ) {
  }

  async createUser(userCreateDto: UserCreateDto) {
    const { name, age } = userCreateDto;
    const user = new this.usersModel({ name, age });
    await user.save();

    if (userCreateDto.friends) {
      const friends = await this.getUsersByIds(userCreateDto.friends);
      await Promise.all(
        friends.map(friend => {
          user.friends.push(friend);
          friend.friends.push(user);
          return friend.save();
        }),
      );
    }
    if (userCreateDto.groups) {

      const groups = await this.groupsModel.find({
        _id: { $in: userCreateDto.groups.map(id => Types.ObjectId(id)) },
      });
      await Promise.all(
        groups.map(group => {
          user.groups.push(group);
          group.users.push(user);
          return group.save();
        }),
      );
    }

    await user.save();

    return user;
  }

  async getUsers() {
    return await this.usersModel
      .find()
      .populate('friends')
      .populate('groups')
      .exec();
  }

  async getUserById(id: string) {
    return await this.usersModel
      .findOne({ _id: id })
      .populate('friends')
      .populate('groups')
      .exec();
  }

  async getUsersByIds(ids: string[]) {
    return await this.usersModel.find({
      _id: {
        $in: ids.map(id => Types.ObjectId(id)),
      },
    }).exec();
  }

  async updateUser(id: string, userUpdateDto: UserUpdateDto) {
    const user = await this.getUserById(id);

    if (!user) {
      return null;
    }

    const { name, age } = userUpdateDto;

    if (userUpdateDto.friends) {
      const oldFriends = await this.getUsersByIds(user.friends.map(({ _id }) => _id));

      await Promise.all(
        oldFriends.map(friend => this.usersModel.findByIdAndUpdate(friend._id, {
          friends: friend.friends.filter(({ _id }) => _id !== id),
        }).exec()),
      );

      const newFriends = await this.getUsersByIds(userUpdateDto.friends);

      await Promise.all(
        newFriends.map(friend => this.usersModel.findByIdAndUpdate(friend._id, {
          friends: [...friend.friends.filter(({ _id }) => _id.toString() !== id), user],
        }).exec()),
      );
    }

    if (userUpdateDto.groups) {
      const oldGroups = await this.groupsModel.find({
        _id: { $in: user.groups.map(({ _id }) => Types.ObjectId(_id)) },
      });

      await Promise.all(
        oldGroups.map(group => {
          group.users = group.users.filter(({ _id }) => _id.toString() !== id);
          return group.save();
        }),
      );

      const newGroups = await this.groupsModel.find({
        _id: { $in: userUpdateDto.groups.map(id => Types.ObjectId(id)) },
      }).populate('users').exec();
      user.groups = [];

      await Promise.all(
        newGroups.map(group => {
          user.groups.push(group);
          group.users = [...group.users.filter(({ _id }) => _id.toString() !== id), user];
          return group.save();
        }),
      );
      await user.save();
    }

    return this.usersModel.findByIdAndUpdate(id, { name, age });
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }
    await this.usersModel.deleteOne({ _id: id }).exec();
    return user;
  }
}
