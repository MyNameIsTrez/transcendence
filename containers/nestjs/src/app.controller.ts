import { Controller, Get, Query } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // TODO: Remove
  @Get('api/hello')
  getHello(): string {
    return this.appService.getHello()
  }
}
