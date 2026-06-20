export interface ShopifyWebhookLineItem {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  quantity: number;
  properties?: Array<{ name: string; value: string }>;
}

export interface ShopifyWebhookPayload {
  id: number;
  email: string | null;
  contact_email: string | null;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  line_items: ShopifyWebhookLineItem[];
  created_at: string;
  name: string;
  note: string | null;
}
