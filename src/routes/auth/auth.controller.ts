import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetUser, Public } from '../../common/decorator';
import { LoginDto, RegisterDto, UpdateStatsDto } from '../../common/dto';
import { RtGuard } from '../../common/guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') userId: User['id']) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('/refresh-tokens')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetUser('id') userId: User['id'],
    @GetUser('refreshToken') refreshToken: User['refreshToken'],
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('get-user')
  @HttpCode(HttpStatus.OK)
  getUser(@GetUser('id') userId: string) {
    return this.authService.getUser(userId);
  }

  @Put('update-stats')
  @HttpCode(HttpStatus.OK)
  geupdateStatsPointstUser(
    @Body() dto: UpdateStatsDto,
    @GetUser('id') userId: string,
  ) {
    return this.authService.updateStatsPoints(dto, userId);
  }
}
