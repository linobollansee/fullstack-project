import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

// Extend from CreateOrderDto to inherit all fields as optional
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    example: OrderStatus.PROCESSING,
    description: 'Order status',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
