import { Module } from '@nestjs/common';
import { PackagingService } from '../application/packaging.service';

@Module({
  providers: [PackagingService],
  exports: [PackagingService],
})
export class PackagingModule {}
