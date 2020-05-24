import { Injectable, NotFoundException } from '@nestjs/common';
import { GroupCreateDto } from '../../dto/group-create.dto';
import { GroupUpdateDto } from '../../dto/group-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../users/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
  }

  async createGroup(groupCreateDto: GroupCreateDto) {
    const { name } = groupCreateDto;
    const group = new Group();
    group.name = name;
    group.users = [];
    await this.groupRepository.save(group);
    const promises = [];

    if (groupCreateDto.users) {
      groupCreateDto.users.forEach(userId => {
        promises.push((async () => {
          const user = await this.userRepository.findOne(userId);
          if (!user) {
            return;
          }
          user.groups.push(group);
          group.users.push(user);
          return this.userRepository.save(user);
        })());
      });
      promises.push(this.groupRepository.save(group));
    }
    await Promise.all(promises);

    return group;
  }

  async getGroups() {
    return this.groupRepository.find();
  }

  async getGroupById(id: string) {
    const group = await this.groupRepository.findOne(id);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async updateGroup(id: string, groupUpdateDto: GroupUpdateDto) {
    const group = await this.getGroupById(id);

    const { name } = groupUpdateDto;

    const promises = [];

    if (groupUpdateDto.users) {
      group.users.forEach(user => {
        user.groups = user.groups.filter(({ _id }) => _id.toString() !== id);
        promises.push(this.userRepository.save(user));
      });
      group.users = [];
      groupUpdateDto.users.forEach(userId => {
        promises.push((async () => {
          const user = await this.userRepository.findOne(userId);
          if (!user) {
            return;
          }
          user.groups = user.groups.filter(({ _id }) => _id.toString() !== id);
          user.groups.push(group);
          group.users.push(user);
          return this.userRepository.save(user);
        })());
      });
    }

    group.name = name;

    promises.push(this.groupRepository.save(group));

    await Promise.all(promises);

    return group;
  }

  async deleteGroup(id: string) {
    const group = await this.getGroupById(id);
    await this.groupRepository.delete(group);
    return group;
  }
}
