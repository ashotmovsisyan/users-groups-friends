import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupSchema } from './models/group.model';
import { UserSchema } from './models/user.model';
import { GroupsModule } from './modules/groups/groups.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest-rest', {
      useFindAndModify: false,
    }),
    MongooseModule.forFeature([
      { name: 'Group', schema: GroupSchema },
      { name: 'User', schema: UserSchema },
    ]),
    GroupsModule,
    UsersModule,
  ],
})
export class AppModule {
}
