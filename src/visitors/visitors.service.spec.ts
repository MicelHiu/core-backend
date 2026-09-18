import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
            findByBookingCode: jest.fn(),
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

  describe('autoCheckIn', () => {
    const booking = { code: 'BK-20260913-ABCDEF', user_id: 'u1', guest_name: 'Budi' };

    it('membuat visitor baru kalau belum pernah check-in untuk booking ini', async () => {
      repository.findByBookingCode.mockResolvedValue(null);
      repository.createVisitor.mockResolvedValue(fakeVisitor as any);

      const result = await service.autoCheckIn(booking);

      expect(result).toEqual(fakeVisitor);
      expect(repository.createVisitor).toHaveBeenCalledWith(
        expect.objectContaining({ booking_code: booking.code, guest_name: booking.guest_name, user_id: booking.user_id }),
      );
    });

    it('tidak membuat visitor baru (idempotent) kalau sudah pernah check-in', async () => {
      repository.findByBookingCode.mockResolvedValue(fakeVisitor as any);

      const result = await service.autoCheckIn(booking);

      expect(result).toEqual(fakeVisitor);
      expect(repository.createVisitor).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    // repository.findAll mengembalikan bookings (+ relasi visitors), bukan visitors
    const fakeBooking = {
      code: 'BK-001',
      user_id: 'u1',
      room_id: 'r1',
      guest_name: 'Budi',
      date_play: new Date('2026-09-13'),
      status: 'ongoing',
      created_at: new Date('2026-09-12T10:00:00.000Z'),
      visitors: [fakeVisitor],
    };

    it('meneruskan range from/to (sudah di-parse jadi Date) ke repository', async () => {
      repository.findAll.mockResolvedValue([fakeBooking] as any);

      await service.findAll({ from: '2026-01-01', to: '2026-09-13' } as any);

      const [from, to] = repository.findAll.mock.calls[0];
      expect(from).toEqual(new Date('2026-01-01'));
      expect(to).toEqual(new Date('2026-09-13'));
    });

    it('meneruskan undefined kalau from/to/search tidak diisi', async () => {
      repository.findAll.mockResolvedValue([] as any);

      await service.findAll({} as any);

      expect(repository.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    });

    it('meneruskan search yang sudah di-trim, dan string kosong dianggap tidak ada', async () => {
      repository.findAll.mockResolvedValue([] as any);

      await service.findAll({ search: '  budi  ' } as any);
      await service.findAll({ search: '   ' } as any);

      expect(repository.findAll).toHaveBeenNthCalledWith(1, undefined, undefined, 'budi');
      expect(repository.findAll).toHaveBeenNthCalledWith(2, undefined, undefined, undefined);
    });

    it('memetakan booking jadi baris visitor', async () => {
      repository.findAll.mockResolvedValue([fakeBooking] as any);

      const [row] = await service.findAll({} as any);

      expect(row).toEqual(expect.objectContaining({
        booking_code: 'BK-001',
        guest_name: 'Budi',
        checked_in: fakeVisitor.checked_in,
        bookings: expect.objectContaining({ code: 'BK-001', status: 'ongoing' }),
      }));
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