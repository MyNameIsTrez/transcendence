import { Module } from '@nestjs/common';
import { PublicModule } from './public/public.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PublicModule, UserModule],
})
export class ApiModule {}
