import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    customerId: number,
  ): Promise<Order> {
    // Create the order
    const order = this.ordersRepository.create({
      customerName: createOrderDto.customerName,
      customerEmail: createOrderDto.customerEmail,
      shippingAddress: createOrderDto.shippingAddress,
      customer: { id: customerId },
    });

    // Save order first to get an ID
    const savedOrder = await this.ordersRepository.save(order);

    // Create order items
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const itemDto of createOrderDto.items) {
      const product = await this.productsRepository.findOne({
        where: { id: itemDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${itemDto.productId} not found`,
        );
      }

      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        product: product,
        quantity: itemDto.quantity,
        price: product.price,
      });

      orderItems.push(orderItem);
      totalAmount += Number(product.price) * itemDto.quantity;
    }

    // Save all order items
    await this.orderItemsRepository.save(orderItems);

    // Update order with total amount
    savedOrder.totalAmount = totalAmount;
    savedOrder.items = orderItems;

    return await this.ordersRepository.save(savedOrder);
  }

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByCustomer(customerId: number): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { customer: { id: customerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findOneByCustomer(id: number, customerId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, customer: { id: customerId } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.ordersRepository.save(order);
  }

  async updateByCustomer(
    id: number,
    updateOrderDto: UpdateOrderDto,
    customerId: number,
  ): Promise<Order> {
    const order = await this.findOneByCustomer(id, customerId);
    Object.assign(order, updateOrderDto);
    return await this.ordersRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }

  async removeByCustomer(id: number, customerId: number): Promise<void> {
    const order = await this.findOneByCustomer(id, customerId);
    await this.ordersRepository.remove(order);
  }
}
