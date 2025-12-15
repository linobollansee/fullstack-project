import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Jane Smith',
    description: 'Customer full name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'jane.smith@example.com',
    description: 'Customer email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Customer password (min 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
