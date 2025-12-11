import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CustomersService } from '../customers/customers.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let customersService: CustomersService;
  let jwtService: JwtService;

  const mockCustomersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    customersService = module.get<CustomersService>(CustomersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new customer and return token', async () => {
      const registerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const customer = {
        id: 1,
        ...registerDto,
        password: 'hashedPassword',
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCustomersService.create.mockResolvedValue(customer);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('customer');
      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result.customer).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('should login and return token for valid credentials', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const customer = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCustomersService.findByEmail.mockResolvedValue(customer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('customer');
      expect(result).toHaveProperty('access_token', 'jwt-token');
      expect(result.customer).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockCustomersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const customer = {
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
      };

      mockCustomersService.findByEmail.mockResolvedValue(customer);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
