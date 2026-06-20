export class OrderCompletedEvent {
  constructor(
    public readonly orderId: string,
    public readonly shopifyOrderId: number,
    public readonly materiales: Array<{ materialCode: string; quantity: number }>,
  ) {}
}
