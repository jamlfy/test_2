import { Module } from '@nestjs/common';
import { InventoryService } from '../application/inventory.service';
import { InventoryRepository } from '../domain/inventory.repository';
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
