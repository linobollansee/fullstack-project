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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // Users are created through /auth/register endpoint

  // Get current user's profile
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    const customer = await this.customersService.findOne(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = customer;
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
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
    @CurrentUser() user: any,
  ) {
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
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (+id !== user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    return this.customersService.remove(+id);
  }
}
