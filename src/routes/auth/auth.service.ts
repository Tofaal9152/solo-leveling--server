import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LoginDto, RegisterDto, UpdateStatsDto } from '../../common/dto';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const hash = await this.hashData(dto.password);

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
        },
      });

      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return {
        message: 'User created successfully',
        tokens,
      };
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('User with this email already exists');
        }
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new ForbiddenException('Invalid email or password');
      }

      const valid = await this.verifyData(dto.password, user.password);

      if (!valid) {
        throw new ForbiddenException('Invalid email or password');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return { tokens };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }
  // update refresh token utils
  async updateRefreshToken(userId: string, refresh_token: string) {
    const refreshTokenHash = await this.hashData(refresh_token);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });
  }

  async logout(userId: string) {
    try {
      await this.prisma.user.updateMany({
        where: { id: userId, refreshToken: { not: null } },
        data: { refreshToken: null },
      });
      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async refreshTokens(userId: string, refresh_token: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new ForbiddenException('User not found');
      }

      const valid = await this.verifyData(refresh_token, user.refreshToken);

      if (!valid) {
        throw new ForbiddenException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email);

      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return { tokens };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async getUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        levelUpXp: user.levelUpXp,
        level: user.level,
        statPoints: user.totalStatePoints,
        health: user.health,
        levelUpHealth: user.levelUpHealth,
        statStrength: user.statStrength,
        statIntelligence: user.statIntelligence,
        statDiscipline: user.statDiscipline,
        statCharisma: user.statCharisma,
        statWillpower: user.statWillpower,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async updateStatsPoints(dto: UpdateStatsDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }
      const sumOfStats =
        dto.statStrength +
        dto.statIntelligence +
        dto.statDiscipline +
        dto.statCharisma +
        dto.statWillpower;
      if (sumOfStats > user.totalStatePoints) {
        throw new ForbiddenException(
          'Total stat points exceed available points',
        );
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          statStrength: dto.statStrength + user.statStrength,
          statIntelligence: dto.statIntelligence + user.statIntelligence,
          statDiscipline: dto.statDiscipline + user.statDiscipline,
          statCharisma: dto.statCharisma + user.statCharisma,
          statWillpower: dto.statWillpower + user.statWillpower,
          totalStatePoints: user.totalStatePoints - sumOfStats,
        },
      });

      return {
        message: 'Stat points updated successfully',
        totalStatePoints: updatedUser,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }
  // utils
  async hashData(data: string): Promise<string> {
    return await argon.hash(data);
  }

  async verifyData(data: string, hash: string): Promise<boolean> {
    return await argon.verify(hash, data);
  }

  async generateTokens(userId: string, email: string) {
    const payload = { id: userId, email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '7d',
        secret: this.config.get<string>('AT_SECRET'),
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '7d',
        secret: this.config.get<string>('RT_SECRET'),
      }),
    ]);

    return { access_token, refresh_token };
  }
}
