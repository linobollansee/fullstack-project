import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomersService } from '../customers/customers.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private customersService: CustomersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const customer = await this.customersService.create(registerDto);
    const { password, ...result } = customer;

    const payload = { email: customer.email, sub: customer.id };
    return {
      customer: result,
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const customer = await this.customersService.findByEmail(loginDto.email);

    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      customer.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = customer;
    const payload = { email: customer.email, sub: customer.id };

    return {
      customer: result,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string): Promise<any> {
    const customer = await this.customersService.findByEmail(email);
    if (customer) {
      const { password, ...result } = customer;
      return result;
    }
    return null;
  }
}
