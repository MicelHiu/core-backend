import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { VisitorListQueryDto, VisitorStatsQueryDto } from './dto/visitor-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  checkIn(@Body() dto: CreateVisitorDto) {
    return this.visitorsService.checkIn(dto);
  }

  // Harus di atas @Get(':id') supaya "/visitors/stats" tidak ketangkep sebagai id
  @Get('stats')
  getStats(@Query() query: VisitorStatsQueryDto) {
    return this.visitorsService.getStats(query);
  }

  @Get()
  findAll(@Query() query: VisitorListQueryDto) {
    return this.visitorsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.visitorsService.findById(id);
  }
}
