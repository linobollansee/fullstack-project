import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Wireless Mouse', description: 'Product name' })
  @Column()
  name: string;

  @ApiProperty({ example: 'Ergonomic wireless mouse', description: 'Product description' })
  @Column('text')
  description: string;

  @ApiProperty({ example: 29.99, description: 'Product price' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
