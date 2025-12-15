import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomersService } from '../customers/customers.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Customer } from '../customers/entities/customer.entity';
import * as bcrypt from 'bcrypt';

export interface AuthResponse {
  customer: Omit<Customer, 'password'>;
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private customersService: CustomersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const customer = await this.customersService.create(registerDto);
    const { password, ...result } = customer;

    const payload = { email: customer.email, sub: customer.id };
    return {
      customer: result,
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
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

  async validateUser(email: string): Promise<Omit<Customer, 'password'> | null> {
    const customer = await this.customersService.findByEmail(email);
    if (customer) {
      const { password, ...result } = customer;
      return result;
    }
    return null;
  }
}
