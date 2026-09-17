import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { Roles } from 'src/auth/roles-decorator';
import { VisitorListQueryDto, VisitorStatsQueryDto } from './dto/visitor-query.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('visitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  // Harus di atas @Get(':id') supaya "/visitors/stats" tidak ketangkep sebagai id
  @Get('stats')
  @ApiOperation({ summary: 'Get visitor stats grouped by day/month/year (admin only)' })
  getStats(@Query() query: VisitorStatsQueryDto) {
    return this.visitorsService.getStats(query);
  }

  @Get()
  @ApiOperation({ summary: 'List visitors, optionally filtered by date range (admin only)' })
  findAll(@Query() query: VisitorListQueryDto) {
    return this.visitorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a visitor by id (admin only)' })
  @ApiParam({ name: 'id', description: 'Visitor id' })
  findById(@Param('id') id: string) {
    return this.visitorsService.findById(id);
  }
}
