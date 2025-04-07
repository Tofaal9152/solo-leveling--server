import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorator';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}
  @Public()
  @Get()
  getHello(): string {
    return this.appService.get();
  }
}
