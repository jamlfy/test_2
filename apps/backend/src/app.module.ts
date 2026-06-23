import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
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
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
          ttl: 30,
        }),
      }),
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    PackagingModule,
    InventoryModule,
    OrdersModule,
  ],
})
export class AppModule {}
