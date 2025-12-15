import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';

@Entity('customers')
export class Customer {
  @ApiProperty({ example: 1, description: 'Customer ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Jane Smith', description: 'Customer full name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Customer email address' })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  password: string;

  @ApiProperty({ type: () => [Order], description: 'Customer orders', required: false })
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
