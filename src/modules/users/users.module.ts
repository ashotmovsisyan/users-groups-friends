import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Group } from '../groups/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Group]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {
}
