import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { BookingsService } from './bookings.service';
import { BookingRepository } from './bookings.repository';
import { CartsRepository } from 'src/carts/carts.repository';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingsRepository: jest.Mocked<BookingRepository>;
  let cartsRepository: jest.Mocked<CartsRepository>;

  const fakeCart = {
    id: 'c1',
    user_id: 'u1',
    room_id: 'r1',
    quantity: 2,
    discount_id: null,
    discount_value: null,
    date_play: new Date('2026-09-20'),
    time_start: new Date('1970-01-01T10:00:00.000Z'),
    time_end: new Date('1970-01-01T12:00:00.000Z'),
    total_price: new Decimal(400000),
  };

  const fakeBooking = {
    code: 'BK-20260913-ABCDEF',
    user_id: 'u1',
    room_id: 'r1',
    guest_name: 'Budi',
    guest_contact: '0812345678',
    time_start: new Date('1970-01-01T10:00:00.000Z'),
    time_end: new Date('1970-01-01T12:00:00.000Z'),
    date_play: new Date('2026-09-20'),
    unit_price: new Decimal(200000),
    quantity: 2,
    total_price: new Decimal(400000),
    status: 'confirmed',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: BookingRepository,
          useValue: {
            getCustomerBookings: jest.fn(),
            getAllBookingDetails: jest.fn(),
            getAllBookings: jest.fn(),
            getBookingDetails: jest.fn(),
            createBooking: jest.fn(),
            updateBooking: jest.fn(),
          },
        },
        {
          provide: CartsRepository,
          useValue: {
            getCartById: jest.fn(),
            deleteCart: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingsRepository = module.get(BookingRepository);
    cartsRepository = module.get(CartsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllBookingDetails', () => {
    it('throw NotFoundException kalau booking tidak ditemukan', async () => {
      bookingsRepository.getAllBookingDetails.mockResolvedValue(null);

      await expect(service.getAllBookingDetails('unknown')).rejects.toThrow(NotFoundException);
    });

    it('mengembalikan booking kalau ditemukan', async () => {
      bookingsRepository.getAllBookingDetails.mockResolvedValue(fakeBooking as any);

      const result = await service.getAllBookingDetails('BK-20260913-ABCDEF');

      expect(result).toEqual(fakeBooking);
    });
  });

  describe('getBookingDetail', () => {
    it('throw NotFoundException kalau booking tidak ditemukan', async () => {
      bookingsRepository.getBookingDetails.mockResolvedValue(null);

      await expect(service.getBookingDetail('u1', 'unknown')).rejects.toThrow(NotFoundException);
    });

    it('mengembalikan booking dengan time_start/time_end diformat', async () => {
      bookingsRepository.getBookingDetails.mockResolvedValue(fakeBooking as any);

      const result = await service.getBookingDetail('u1', 'BK-20260913-ABCDEF');

      expect(result.time_start).toBe('10:00');
      expect(result.time_end).toBe('12:00');
    });
  });

  describe('createBooking', () => {
    const dto = { cart_id: 'c1', guest_name: 'Budi', guest_contact: '0812345678' };

    it('throw NotFoundException kalau cart tidak ditemukan', async () => {
      cartsRepository.getCartById.mockResolvedValue(null);

      await expect(service.createBooking('u1', dto as any)).rejects.toThrow(NotFoundException);
    });

    it('berhasil createBooking: hitung unit_price dan hapus cart setelahnya', async () => {
      cartsRepository.getCartById.mockResolvedValue(fakeCart as any);
      bookingsRepository.createBooking.mockResolvedValue(fakeBooking as any);

      const result = await service.createBooking('u1', dto as any);

      // unit_price = total_price / quantity = 400000 / 2 = 200000
      const calledArg = bookingsRepository.createBooking.mock.calls[0][0];
      expect(calledArg.unit_price.toString()).toBe('200000');
      expect(calledArg.status).toBe('confirmed');

      // pastikan cart dihapus setelah jadi booking
      expect(cartsRepository.deleteCart).toHaveBeenCalledWith('c1', 'u1');

      expect(result.time_start).toBe('10:00');
    });
  });

  describe('updateBooking', () => {
    it('throw NotFoundException kalau booking tidak ditemukan', async () => {
      bookingsRepository.getAllBookingDetails.mockResolvedValue(null);

      await expect(service.updateBooking('u1', 'unknown', { status: 'ongoing' } as any))
        .rejects.toThrow(NotFoundException);
    });

    it('throw BadRequestException kalau transisi status tidak valid (confirmed -> completed)', async () => {
      bookingsRepository.getAllBookingDetails.mockResolvedValue(fakeBooking as any); // status: confirmed

      await expect(
        service.updateBooking('u1', fakeBooking.code, { status: 'completed' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('berhasil update status kalau transisi valid (confirmed -> ongoing)', async () => {
      bookingsRepository.getAllBookingDetails.mockResolvedValue(fakeBooking as any);
      bookingsRepository.updateBooking.mockResolvedValue({ ...fakeBooking, status: 'ongoing' } as any);

      const result = await service.updateBooking('u1', fakeBooking.code, { status: 'ongoing' } as any);

      expect(bookingsRepository.updateBooking).toHaveBeenCalledWith(
        fakeBooking.code,
        expect.objectContaining({ status: 'ongoing' }),
      );
      expect(result.status).toBe('ongoing');
    });

    it('tidak throw kalau status sama dengan status existing (tidak dianggap transisi)', async () => {
      bookingsRepository.getAllBookingDetails.mockResolvedValue(fakeBooking as any); // confirmed
      bookingsRepository.updateBooking.mockResolvedValue(fakeBooking as any);

      await expect(
        service.updateBooking('u1', fakeBooking.code, { status: 'confirmed' } as any),
      ).resolves.toBeDefined();
    });
  });
});