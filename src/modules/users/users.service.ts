import { Injectable, NotFoundException } from '@nestjs/common';

import { UserCreateDto } from '../../dto/user-create.dto';
import { UserUpdateDto } from '../../dto/user-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../groups/group.entity';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
  }

  async createUser(userCreateDto: UserCreateDto) {
    const { name, age } = userCreateDto;
    const user = new User();
    user.name = name;
    user.age = age;
    user.friends = [];
    user.groups = [];
    await this.userRepository.save(user);
    const promises = [];

    if (userCreateDto.friends) {
      userCreateDto.friends.forEach(friendId => {
        promises.push((async () => {
          const friend = await this.userRepository.findOne(friendId);
          console.log('f', friend);
          if (!friend) {
            return;
          }
          friend.friends.push(user);
          user.friends.push(friend);
          return this.userRepository.save(friend);
        })());
      });
    }

    if (userCreateDto.groups) {
      userCreateDto.groups.forEach(groupId => {
        promises.push((async () => {
          const group = await this.groupRepository.findOne(groupId);
          console.log('g', group);
          if (!group) {
            return;
          }
          group.users.push(user);
          user.groups.push(group);
          return this.groupRepository.save(group);
        })());
      });
    }

    promises.push(this.userRepository.save(user));

    await Promise.all(promises);

    return user;
  }

  async getUsers() {
    return this.userRepository.find();
  }

  async getUserById(id: string) {
    const user = await this.userRepository
      .findOne({ _id: id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, userUpdateDto: UserUpdateDto) {
    const user = await this.getUserById(id);

    const { name, age } = userUpdateDto;

    const promises = [];

    if (userUpdateDto.friends) {
      user.friends.forEach(friend => {
        friend.friends = friend.friends.filter(({ _id }) => _id.toString() !== id);
        promises.push(this.userRepository.save(friend));
      });
      user.friends = [];
      userUpdateDto.friends.forEach(friendId => {
        promises.push((async () => {
          const friend = await this.userRepository.findOne(friendId);
          if (!friend) {
            return;
          }
          friend.friends = friend.friends.filter(({ _id }) => _id.toString() !== id);
          friend.friends.push(user);
          user.friends.push(friend);
          return this.userRepository.save(friend);
        })());
      });
    }

    if (userUpdateDto.groups) {
      user.groups.forEach(group => {
        group.users = group.users.filter(({ _id }) => _id.toString() !== id);
        promises.push(this.groupRepository.save(group));
      });
      user.friends = [];
      userUpdateDto.groups.forEach(groupId => {
        promises.push((async () => {
          const group = await this.groupRepository.findOne(groupId);
          if (!group) {
            return;
          }
          group.users = group.users.filter(({ _id }) => _id.toString() !== id);
          group.users.push(user);
          user.groups.push(group);
          return this.groupRepository.save(group);
        })());
      });
    }

    user.name = name;
    user.age = age;
    promises.push(this.userRepository.save(user));
    await Promise.all(promises);

    return user;
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    await this.userRepository.delete(user);
    return user;
  }
}
