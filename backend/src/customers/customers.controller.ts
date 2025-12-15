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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

type CustomerResponse = Omit<Customer, 'password'>;

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Users are created through /auth/register endpoint

  // Get all customers
  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List of all customers', type: [Customer] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get current authenticated customer profile' })
  @ApiResponse({ status: 200, description: 'Customer profile', type: Customer })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: AuthUser): Promise<CustomerResponse> {
    const customer = await this.customersService.findOne(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = customer;
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found', type: Customer })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only access own profile' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
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
  @ApiOperation({ summary: 'Update customer profile' })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ status: 200, description: 'Customer successfully updated', type: Customer })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update own profile' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
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
  @ApiOperation({ summary: 'Delete customer account' })
  @ApiResponse({ status: 204, description: 'Customer successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete own profile' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<void> {
    if (+id !== user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    return this.customersService.remove(+id);
  }
}
