import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      message:
        'Backend is working. Visit /api for the REST API documentation of the fullstack online shop application.',
    };
  }
}
