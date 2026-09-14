import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { VisitorsRepository } from './visitors.repository';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('VisitorsService', () => {
  let service: VisitorsService;
  let repository: jest.Mocked<VisitorsRepository>;

  const fakeVisitor = {
    id: 'v1',
    booking_code: 'BK-20260913-ABCDEF',
    user_id: 'u1',
    guest_name: 'Budi',
    checked_in: new Date('2026-09-13T10:00:00.000Z'),
    created_at: new Date('2026-09-13T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorsService,
        {
          provide: VisitorsRepository,
          useValue: {
            getBookingStatus: jest.fn(),
            createVisitor: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            findCheckedInInRange: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VisitorsService>(VisitorsService);
    repository = module.get(VisitorsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkIn', () => {
    const dto = { booking_code: 'BK-20260913-ABCDEF', guest_name: 'Budi' };

    it('throw NotFoundException kalau booking tidak ditemukan', async () => {
      repository.getBookingStatus.mockResolvedValue(null);

      await expect(service.checkIn(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('throw BadRequestException kalau status booking bukan confirmed/ongoing', async () => {
      repository.getBookingStatus.mockResolvedValue({ status: 'canceled', user_id: 'u1' } as any);

      await expect(service.checkIn(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('berhasil check-in kalau status confirmed', async () => {
      repository.getBookingStatus.mockResolvedValue({ status: 'confirmed', user_id: 'u1' } as any);
      repository.createVisitor.mockResolvedValue(fakeVisitor as any);

      const result = await service.checkIn(dto as any);

      expect(result).toEqual(fakeVisitor);
      expect(repository.createVisitor).toHaveBeenCalledWith(
        expect.objectContaining({ booking_code: dto.booking_code, guest_name: dto.guest_name, user_id: 'u1' }),
      );
    });

    it('berhasil check-in kalau status ongoing', async () => {
      repository.getBookingStatus.mockResolvedValue({ status: 'ongoing', user_id: 'u1' } as any);
      repository.createVisitor.mockResolvedValue(fakeVisitor as any);

      await expect(service.checkIn(dto as any)).resolves.toEqual(fakeVisitor);
    });
  });

  describe('findAll', () => {
    it('meneruskan range from/to (sudah di-parse jadi Date) ke repository', () => {
      repository.findAll.mockReturnValue([fakeVisitor] as any);

      service.findAll({ from: '2026-01-01', to: '2026-09-13' } as any);

      const [from, to] = repository.findAll.mock.calls[0];
      expect(from).toEqual(new Date('2026-01-01'));
      expect(to).toEqual(new Date('2026-09-13'));
    });

    it('meneruskan undefined kalau from/to tidak diisi', () => {
      repository.findAll.mockReturnValue([] as any);

      service.findAll({} as any);

      expect(repository.findAll).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('findById', () => {
    it('throw NotFoundException kalau visitor tidak ditemukan', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });

    it('mengembalikan visitor kalau ditemukan', async () => {
      repository.findById.mockResolvedValue(fakeVisitor as any);

      await expect(service.findById('v1')).resolves.toEqual(fakeVisitor);
    });
  });

  describe('getStats', () => {
    it('groupBy month (default): mengembalikan 12 baris, bertambah di bulan yang sesuai', async () => {
      // checked_in bulan Maret (index 2) dan September (index 8)
      repository.findCheckedInInRange.mockResolvedValue([
        { checked_in: new Date(Date.UTC(2026, 2, 15)) },
        { checked_in: new Date(Date.UTC(2026, 8, 1)) },
        { checked_in: new Date(Date.UTC(2026, 8, 10)) },
      ] as any);

      const result = await service.getStats({ year: 2026 } as any);

      expect(result).toHaveLength(12);
      expect(result[2]).toEqual({ month: 3, count: 1 });
      expect(result[8]).toEqual({ month: 9, count: 2 });
      expect(result[0]).toEqual({ month: 1, count: 0 });
    });

    it('groupBy year: mengembalikan rentang fromYear..toYear', async () => {
      repository.findCheckedInInRange.mockResolvedValue([
        { checked_in: new Date(Date.UTC(2024, 0, 1)) },
        { checked_in: new Date(Date.UTC(2024, 5, 1)) },
        { checked_in: new Date(Date.UTC(2026, 0, 1)) },
      ] as any);

      const result = await service.getStats({ groupBy: 'year', fromYear: 2023, toYear: 2026 } as any);

      expect(result).toEqual([
        { year: 2023, count: 0 },
        { year: 2024, count: 2 },
        { year: 2025, count: 0 },
        { year: 2026, count: 1 },
      ]);
    });

    it('groupBy day: mengembalikan jumlah hari sesuai bulan yang diminta', async () => {
      repository.findCheckedInInRange.mockResolvedValue([
        { checked_in: new Date(Date.UTC(2026, 1, 5)) }, // 5 Feb
      ] as any);

      // Februari 2026 (bukan kabisat) = 28 hari
      const result = await service.getStats({ groupBy: 'day', year: 2026, month: 2 } as any);

      expect(result).toHaveLength(28);
      expect(result[4]).toEqual({ date: '2026-02-05', count: 1 });
    });
  });
});