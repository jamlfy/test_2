import { ApiProperty } from '@nestjs/swagger';

export class ShopifyWebhookLineItem {
  @ApiProperty() id: number;
  @ApiProperty() product_id: number;
  @ApiProperty() sku: string;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty({ required: false })
  properties?: Array<{ name: string; value: string }>;
}

export class ShopifyCustomer {
  @ApiProperty() first_name: string;
  @ApiProperty() last_name: string;
  @ApiProperty() email: string;
}

export class ShopifyWebhookDto {
  @ApiProperty() id: number;
  @ApiProperty({ required: false }) email: string | null;
  @ApiProperty({ required: false }) contact_email: string | null;
  @ApiProperty({ required: false }) customer: ShopifyCustomer | null;
  @ApiProperty({ type: [ShopifyWebhookLineItem] }) line_items: ShopifyWebhookLineItem[];
  @ApiProperty() created_at: string;
  @ApiProperty() name: string;
  @ApiProperty({ required: false }) note: string | null;
}
