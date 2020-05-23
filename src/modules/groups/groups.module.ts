import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupSchema } from '../../models/group.model';
import { UserSchema } from '../../models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Group', schema: GroupSchema },
      { name: 'User', schema: UserSchema },
    ])
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {
}
