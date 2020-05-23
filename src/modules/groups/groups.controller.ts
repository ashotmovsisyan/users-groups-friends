import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupUpdateDto } from '../../dto/group-update.dto';
import { GroupCreateDto } from '../../dto/group-create.dto';

@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {
  }

  @Get()
  async getGroups() {
    return await this.groupsService.getGroups();
  }

  @Get('/:id')
  async getGroupById(@Param('id') id: string) {
    const group = await this.groupsService.getGroupById(id);
    if (!group) {
      throw new NotFoundException(`Group with id: ${id} not found`);
    }
    return group;
  }

  @Post()
  async createGroup(@Body() groupCreateDto: GroupCreateDto) {
    return await this.groupsService.createGroup(groupCreateDto);
  }

  @Put('/:id')
  async updateGroup(
    @Param('id') id: string,
    @Body() groupUpdateDto: GroupUpdateDto,
  ) {
    const group = await this.groupsService.updateGroup(id, groupUpdateDto);
    if (!group) {
      throw new NotFoundException(`Group with id: ${id} not found`);
    }
    return group;
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    const group = await this.groupsService.deleteGroup(id);
    if (!group) {
      throw new NotFoundException(`Group with id: ${id} not found`);
    }
    return group;
  }
}
