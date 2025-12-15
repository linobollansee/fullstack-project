import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

type CustomerResponse = Omit<Customer, 'password'>;

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Users are created through /auth/register endpoint

  // Get all customers
  @Get()
  async findAll(): Promise<CustomerResponse[]> {
    const customers = await this.customersService.findAll();
    // Remove passwords from response
    return customers.map((customer) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = customer;
      return result;
    });
  }

  // Get current user's profile
  @Get('me')
  async getProfile(@CurrentUser() user: AuthUser): Promise<CustomerResponse> {
    const customer = await this.customersService.findOne(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = customer;
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<CustomerResponse> {
    if (+id !== user.id) {
      throw new ForbiddenException('You can only access your own profile');
    }
    const customer = await this.customersService.findOne(+id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = customer;
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: AuthUser,
  ): Promise<CustomerResponse> {
    if (+id !== user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const customer = await this.customersService.update(+id, updateCustomerDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = customer;
    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<void> {
    if (+id !== user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    return this.customersService.remove(+id);
  }
}
