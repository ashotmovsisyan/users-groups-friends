import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from '../../models/group.model';
import { User } from '../../models/user.model';
import { GroupCreateDto } from '../../dto/group-create.dto';
import { GroupUpdateDto } from '../../dto/group-update.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel('Group')
    private groupsModel: Model<Group>,
    @InjectModel('User')
    private usersModel: Model<User>,
  ) {
  }

  async createGroup(groupCreateDto: GroupCreateDto) {
    const { name } = groupCreateDto;
    const group = new this.groupsModel({ name });
    await group.save();

    if (groupCreateDto.users) {
      const users = await this.usersModel.find({
        _id: {
          $in: groupCreateDto.users.map(id => Types.ObjectId(id)),
        },
      }).exec();

      await Promise.all(
        users.map(user => {
          user.groups.push(group);
          group.users.push(user);
          return user.save();
        }),
      );
      await group.save();
    }

    return group;
  }

  async getGroups() {
    return await this.groupsModel
      .find()
      .populate('users')
      .exec();
  }

  async getGroupById(id: string) {
    return await this.groupsModel
      .findOne({ _id: id })
      .populate('users')
      .exec();
  }

  async updateGroup(id: string, groupUpdateDto: GroupUpdateDto) {
    const group = await this.getGroupById(id);

    if (!group) {
      return null;
    }

    const { name } = groupUpdateDto;
    if (groupUpdateDto.users) {
      const oldUsers = await this.usersModel.find({
        _id: {
          $in: group.users.map(({ _id }) => Types.ObjectId(_id)),
        },
      }).exec();

      await Promise.all(
        oldUsers.map(user => {
          user.groups = user.groups.filter(({ _id }) => _id.toString() !== id);
          return user.save();
        }),
      );

      const newUsers = await this.usersModel.find({
        _id: {
          $in: groupUpdateDto.users.map(id => Types.ObjectId(id)),
        },
      }).exec();
      group.users = [];
      await Promise.all(
        newUsers.map(user => {
          user.groups = [...user.groups.filter(({ _id }) => _id.toString() !== id), group];
          group.users.push(user);
          return user.save();
        }),
      );
      await group.save();
    }

    return this.groupsModel.findByIdAndUpdate(id, { name });
  }

  async deleteGroup(id: string) {
    const group = await this.getGroupById(id);
    if (!group) {
      return null;
    }
    await this.groupsModel.deleteOne({ _id: id }).exec();
    return group;
  }
}
