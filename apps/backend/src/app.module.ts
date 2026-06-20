import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { OrdersModule } from '@test_2/backend-orders';
import { InventoryModule } from '@test_2/backend-inventory';
import { PackagingModule } from '@test_2/backend-packaging';
import { PrismaModule } from '@test_2/prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    PackagingModule,
    InventoryModule,
    OrdersModule,
  ],
})
export class AppModule {}
