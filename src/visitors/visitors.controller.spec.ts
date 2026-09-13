import { Test, TestingModule } from '@nestjs/testing';
import { VisitorsController } from './visitors.controller';
import { VisitorsService } from './visitors.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('VisitorsController', () => {
  let controller: VisitorsController;
  let service: jest.Mocked<VisitorsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitorsController],
      providers: [
        {
          provide: VisitorsService,
          useValue: {
            checkIn: jest.fn(),
            getStats: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VisitorsController>(VisitorsController);
    service = module.get(VisitorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('checkIn memanggil service dengan dto', () => {
    const dto = { booking_code: 'BK-20260913-ABCDEF', guest_name: 'Budi' };
    controller.checkIn(dto as any);
    expect(service.checkIn).toHaveBeenCalledWith(dto);
  });

  it('getStats memanggil service dengan query', () => {
    const query = { groupBy: 'month' as const, year: 2026 };
    controller.getStats(query as any);
    expect(service.getStats).toHaveBeenCalledWith(query);
  });

  it('findAll memanggil service dengan query', () => {
    const query = { from: '2026-01-01', to: '2026-09-13' };
    controller.findAll(query as any);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('findById memanggil service dengan id dari param', () => {
    controller.findById('v1');
    expect(service.findById).toHaveBeenCalledWith('v1');
  });
});