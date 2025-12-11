import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'Fullstack Shop API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        documentation: '/api',
        products: '/products',
        orders: '/orders',
        customers: '/customers',
        auth: {
          login: '/auth/login',
          register: '/auth/register',
        },
      },
      message: 'Visit /api for complete API documentation',
    };
  }
}
