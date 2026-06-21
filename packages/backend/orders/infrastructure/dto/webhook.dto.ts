import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ShopifyWebhookLineItem {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  product_id: number;

  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  properties?: Array<{ name: string; value: string }>;
}

export class ShopifyCustomer {
  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsString()
  email: string;
}

export class ShopifyWebhookDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contact_email: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShopifyCustomer)
  customer: ShopifyCustomer | null;

  @ApiProperty({ type: [ShopifyWebhookLineItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShopifyWebhookLineItem)
  line_items: ShopifyWebhookLineItem[];

  @ApiProperty()
  @IsString()
  created_at: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note: string | null;
}
