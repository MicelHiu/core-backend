import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  getAllRooms() {
    return this.roomsService.getAllRooms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by id' })
  @ApiParam({ name: 'id', description: 'Room id' })
  getRoomById(@Param('id') id: string) {
    return this.roomsService.getRoomById(id);
  }
}
