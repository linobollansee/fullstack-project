import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 1, description: 'Order item ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ApiProperty({ type: () => Product, description: 'Product details' })
  @ManyToOne(() => Product, { eager: true })
  product: Product;

  @ApiProperty({ example: 2, description: 'Quantity ordered' })
  @Column('int')
  quantity: number;

  @ApiProperty({ example: 29.99, description: 'Price at time of order' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
