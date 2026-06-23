import { createHash } from 'crypto';

export function generateIdempotencyKey(shopifyOrderId: number, storeName: string): string {
  return createHash('sha256').update(`${shopifyOrderId}:${storeName}`).digest('hex');
}
