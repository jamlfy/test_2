export class OrderFailedEvent {
  constructor(
    public readonly orderId: string,
    public readonly shopifyOrderId: number,
    public readonly reason: string,
  ) {}
}
