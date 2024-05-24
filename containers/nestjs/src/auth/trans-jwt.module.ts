import { Module } from '@nestjs/common';
import TransJwtService from './trans-jwt-service';

@Module({
  providers: [TransJwtService],
  exports: [TransJwtService],
})
export class TransJwtModule {}
