import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ShopifyWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const hmac = request.headers['x-shopify-hmac-sha256'] as string;
    console.log('mix', hmac);
    if (!hmac) {
      throw new UnauthorizedException('Missing X-Shopify-Hmac-SHA256 header');
    }

    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Shopify webhook secret not configured');
    }

    const rawBody = request.rawBody || JSON.stringify(request.body);

    const computedHash = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

    const isValid = crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hmac));

    if (!isValid) {
      throw new UnauthorizedException('Invalid Shopify webhook HMAC signature');
    }

    return true;
  }
}
