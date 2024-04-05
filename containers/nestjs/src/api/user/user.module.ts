import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [UserController],
})
export class UserModule {}
