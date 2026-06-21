import { Module } from '@nestjs/common';
import { InventoryService } from '../application/inventory.service';
import { InventoryRepositoryImpl } from './inventory.repository.impl';

@Module({
  providers: [
    InventoryService,
    {
      provide: 'InventoryRepository',
      useClass: InventoryRepositoryImpl,
    },
    InventoryRepositoryImpl,
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
