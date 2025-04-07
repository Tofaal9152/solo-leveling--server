import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { GetUser, Public } from '../../common/decorator';
import { QuestService } from './quest.service';
import {
  CreateQuestDto,
  UpdateQuestDto,
  updateQuestStatusDto,
} from '../../common/dto/quest.dto';

@Controller('quest')
export class QuestController {
  constructor(private questService: QuestService) {}

  @Post('create')
  createQuest(@Body() dto: CreateQuestDto, @GetUser('id') userId: string) {
    return this.questService.createQuest(dto, userId);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('get-quests')
  allQuest(@Query('page') page?: string) {
    return this.questService.allQuest(page);
  }

  @HttpCode(HttpStatus.OK)
  @Get('user-quests')
  getUserQuest(@GetUser('id') userId: string) {
    return this.questService.getUserQuest(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete/:id')
  deleteQuest(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.questService.deleteQuest(id, userId);
  }

  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateTodo(
    @Param('id') id: string,
    @Body() dto: UpdateQuestDto,
    @GetUser('id') userId: string,
  ) {
    return this.questService.updateQuest(id, dto, userId);
  }
  // update status of quest
  @Put('update-status/:id')
  @HttpCode(HttpStatus.OK)
  updateQuestStatus(
    @Param('id') id: string,
    @Body() dto: updateQuestStatusDto,
    @GetUser('id') userId: string,
  ) {
    return this.questService.updateQuestStatus(id, dto, userId);
  }
  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('refresh-quest')
  getQuest() {
    return this.questService.handleDailyQuestReset();
  }
}
