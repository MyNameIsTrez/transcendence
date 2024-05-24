import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Creation } from './creation.entity';
import { CreationService } from './creation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Creation])],
  providers: [CreationService],
  exports: [CreationService],
})
export class CreationModule {}
