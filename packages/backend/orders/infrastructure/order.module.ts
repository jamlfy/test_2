import { Module } from '@nestjs/common';
import { BullMQModule } from '@nestjs/bullmq';
import { OrderController } from './order.controller';
import { OrderProcessor } from './order.processor';
import { QueueService } from './queue.service';
import { OrderService } from '../application/order.service';
import { OrderRepository } from '../domain/order.repository';
import { OrderRepositoryImpl } from './order.repository.impl';
import { InventoryModule } from '@test_2/backend-inventory';
import { PackagingModule } from '@test_2/backend-packaging';
import { QUEUE_NAMES } from '@test_2/share-utils';

@Module({
  imports: [
    InventoryModule,
    PackagingModule,
    BullMQModule.registerQueue({
      name: QUEUE_NAMES.ORDERS,
    }),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    QueueService,
    OrderProcessor,
    {
      provide: 'OrderRepository',
      useClass: OrderRepositoryImpl,
    },
    OrderRepositoryImpl,
  ],
  exports: [OrderService, QueueService],
})
export class OrdersModule {}
