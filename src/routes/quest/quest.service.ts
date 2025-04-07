import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { calculateLevelUp } from '../../common/utils/leveling';
import {
  CreateQuestDto,
  UpdateQuestDto,
  updateQuestStatusDto,
} from '../../common/dto/quest.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuestService {
  private readonly logger = new Logger(QuestService.name);
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createQuest(dto: CreateQuestDto, userId: string) {
    try {
      const createQuest = await this.prisma.quest.create({
        data: {
          title: dto.title,
          description: dto.description,
          xp: dto.xp,
          statPoints: dto.statPoints,
          healthPoints: dto.healthPoints,
          frequency: dto.frequency,
          userId: userId,
        },
      });
      if (!createQuest) {
        throw new ForbiddenException('Quest not created');
      }
      return {
        message: 'Quest created successfully',
        createQuest,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async allQuest(pageNumber?: string) {
    try {
      const page = parseInt(pageNumber) || 1;
      const take = 10;
      const skip = (page - 1) * take;

      const totalCount = await this.prisma.quest.count();
      const totalPages = Math.ceil(totalCount / take);
      if (totalCount === 0) {
        return {
          message: 'No quests available',
          total: totalCount,
          totalPages: 0,
          currentPage: 1,
          next: null,
          previous: null,
          results: [],
        };
      }

      if (page < 1 || page > totalPages) {
        throw new ForbiddenException('page is out of range');
      }

      const quests = await this.prisma.quest.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          xp: true,
          statPoints: true,
          healthPoints: true,
          frequency: true,
          status: true,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      });

      const baseUrl = this.config.get<string>('BASE_URL');

      return {
        total: totalCount,
        totalPages,
        currentPage: page,
        next:
          page < totalPages
            ? `${baseUrl}/quest/get-quests/?page=${page + 1}`
            : null,
        previous:
          page > 1 ? `${baseUrl}/quest/get-quests/?page=${page - 1}` : null,
        results: quests,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async getUserQuest(userId: string) {
    try {
      // const page = parseInt(pageNumber) || 1;
      // const take = 10;
      // const skip = (page - 1) * take;

      // const totalCount = await this.prisma.quest.count({ where: { userId } });
      // const totalPages = Math.ceil(totalCount / take);
      // if (totalCount === 0) {
      //   return {
      //     message: 'No quests available',
      //     total: totalCount,
      //     totalPages: 0,
      //     currentPage: 1,
      //     next: null,
      //     previous: null,
      //     results: [],
      //   };
      // }

      // if (page < 1 || page > totalPages) {
      //   throw new ForbiddenException('page is out of range');
      // }

      const quest = await this.prisma.quest.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          description: true,
          xp: true,
          statPoints: true,
          healthPoints: true,
          frequency: true,
          status: true,
        },
        // skip,
        // take,
        orderBy: { createdAt: 'desc' },
      });

      // const baseUrl = this.config.get<string>('BASE_URL');

      return {
        // total: totalCount,
        // totalPages,
        // currentPage: page,
        // next:
        //   page < totalPages
        //     ? `${baseUrl}/quest/user-quests/?page=${page + 1}`
        //     : null,
        // previous:
        //   page > 1 ? `${baseUrl}/quest/user-quests/?page=${page - 1}` : null,
        results: quest,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async deleteQuest(id: string, userId: string) {
    try {
      const quest = await this.prisma.quest.findUnique({
        where: { id },
      });

      if (!quest) {
        throw new ForbiddenException('Quest not found');
      }

      if (quest.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to delete this quest',
        );
      }

      await this.prisma.quest.delete({
        where: { id },
      });

      return {
        message: 'Quest deleted successfully',
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async updateQuest(id: string, dto: UpdateQuestDto, userId: string) {
    try {
      const quest = await this.prisma.quest.findUnique({
        where: { id },
      });

      if (!quest) {
        throw new ForbiddenException('Quest not found');
      }

      if (quest.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to update this quest',
        );
      }

      const updatedQuest = await this.prisma.quest.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          xp: dto.xp,
          statPoints: dto.statPoints,
          healthPoints: dto.healthPoints,
          frequency: dto.frequency,
          status: dto.status,
        },
      });

      return {
        message: 'Quest updated successfully',
        updatedQuest,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  async updateQuestStatus(
    id: string,
    dto: updateQuestStatusDto,
    userId: string,
  ) {
    try {
      const quest = await this.prisma.quest.findUnique({
        where: { id },
      });

      if (!quest) {
        throw new ForbiddenException('Quest not found');
      }

      if (quest.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to update this quest',
        );
      }

      // Only process rewards if marking as COMPLETED
      if (dto.status === 'COMPLETED' && quest.status === 'COMPLETED') {
        throw new ForbiddenException('Quest already completed');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }
      const {
        xp,
        health,
        level,
        levelUpXp,
        levelUpHealth,
        totalStatePoints,
        leveledUp,
      } = calculateLevelUp({
        currentXp: user.xp,
        currentHp: user.health,
        healthGain: quest.healthPoints,
        xpGain: quest.xp,
        currentLevel: user.level,
        currentLevelUpXp: user.levelUpXp,
        currentLevelUpHealth: user.levelUpHealth,
        currentStatPoints: user.totalStatePoints + quest.statPoints,
      });

      const [updatedQuest, updatedUser] = await this.prisma.$transaction([
        this.prisma.quest.update({
          where: { id },
          data: { status: dto.status },
        }),
        this.prisma.user.update({
          where: { id: userId },
          data: {
            xp,
            level,
            levelUpXp,
            levelUpHealth,
            health,
            totalStatePoints,
          },
        }),
      ]);

      return {
        message: `Quest completed${leveledUp ? ' and leveled up!' : ''}`,
        updatedQuest,
        updatedUser,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new ForbiddenException(error.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyQuestReset() {
    try {
      const incompleteQuests = await this.prisma.quest.findMany({
        where: {
          frequency: 'DAILY',
          status: 'PENDING',
        },
        include: {
          user: true,
        },
      });

      for (const quest of incompleteQuests) {
        const user = quest.user;

        let newHealth = user.health - 10;
        if (newHealth < 0) {
          newHealth = 0;
        }

        await this.prisma.user.update({
          where: { id: user.id },
          data: { health: newHealth },
        });

        console.log(
          `User ${user.name} had an incomplete daily quest. Health reduced to ${newHealth}.`,
        );
      }

      const updated = await this.prisma.quest.updateMany({
        where: {
          frequency: 'DAILY',
        },
        data: {
          status: 'PENDING', // Reset status to 'PENDING'
        },
      });

      console.log(`✅ Daily Quests Reset: ${updated.count} quests updated.`);
    } catch (error) {
      console.error('Error during daily quest reset: ', error.message);
    }
  }
}
