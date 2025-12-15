import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'Product ID',
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the product',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Customer full name',
  })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Customer email address',
  })
  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @ApiProperty({
    example: '123 Main St, New York, NY 10001',
    description: 'Shipping address',
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({
    example: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
    description: 'Array of order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
