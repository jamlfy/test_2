import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue, Job } from 'bullmq';
import { QUEUE_NAMES } from '@test_2/share-utils';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly queue: Queue;

  constructor() {
    const connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    };

    this.queue = new Queue(QUEUE_NAMES.ORDERS, { connection });
  }

  async addOrderJob(orderId: string): Promise<Job> {
    return this.queue.add(
      'process-order',
      { orderId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async onModuleDestroy() {
    await this.queue.close();
  }

  getQueue(): Queue {
    return this.queue;
  }
}
