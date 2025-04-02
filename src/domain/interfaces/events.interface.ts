import { OrderStatus } from 'domain/enums/order-status.enum';

export interface OrderStatusUpdateEvent {
  orderId: number;
  status: OrderStatus;
}

export interface OrderInvoiceGenerationEvent {
  orderId: number;
  userId: number;
  totalAmount: number;
  orderDate: Date;
}

export interface OrderFailedEvent {
  orderId: number;
  userId: number;
  totalAmount: number;
  reason: string;
}

export interface EventMessage {
  queueName: string;
  message: unknown;
}
