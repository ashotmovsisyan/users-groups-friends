import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Group } from './group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Group]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {
}
