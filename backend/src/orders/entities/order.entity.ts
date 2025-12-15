import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';
import { Customer } from '../../customers/entities/customer.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @ApiProperty({ example: 1, description: 'Order ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  customer: Customer;

  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @Column({ nullable: true })
  customerName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Customer email' })
  @Column({ nullable: true })
  customerEmail: string;

  @ApiProperty({ example: '123 Main St, New York, NY 10001', description: 'Shipping address' })
  @Column({ nullable: true })
  shippingAddress: string;

  @ApiProperty({ example: OrderStatus.PENDING, enum: OrderStatus, description: 'Order status' })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({ example: 99.99, description: 'Total order amount' })
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty({ type: () => [OrderItem], description: 'Order items' })
  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
