import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/interfaces/auth-user.interface';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order successfully created', type: Order })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: AuthUser): Promise<Order> {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the authenticated customer' })
  @ApiResponse({ status: 200, description: 'List of customer orders', type: [Order] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: AuthUser): Promise<Order[]> {
    return this.ordersService.findAllByCustomer(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<Order> {
    return this.ordersService.findOneByCustomer(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order (typically to change status)' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order successfully updated', type: Order })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Order> {
    return this.ordersService.updateByCustomer(+id, updateOrderDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiResponse({ status: 204, description: 'Order successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser): Promise<void> {
    return this.ordersService.removeByCustomer(+id, user.id);
  }
}
