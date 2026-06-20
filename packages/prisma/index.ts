import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA_CLIENT',
      useFactory: () => new PrismaClient(),
    },
    {
      provide: PrismaClient,
      useExisting: 'PRISMA_CLIENT',
    },
  ],
  exports: ['PRISMA_CLIENT', PrismaClient],
})
export class PrismaModule {}

export { PrismaClient };
