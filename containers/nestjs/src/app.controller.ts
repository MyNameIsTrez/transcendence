import { Controller, Get, Query } from '@nestjs/common'
import { AppService } from './app.service'

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // TODO: Remove
  @Get('hello')
  getHello(): string {
    return this.appService.getHello()
  }

  // TODO: Improve
  @Get('login')
  test(@Query('code') code: number): string {
    console.log(code)
    return this.appService.getHello()
  }
}
