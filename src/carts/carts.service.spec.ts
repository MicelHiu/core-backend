import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { CartsService } from './carts.service';
import { CartsRepository } from './carts.repository';

describe('CartsService', () => {
  let service: CartsService;
  let repository: jest.Mocked<CartsRepository>;

  // fake data mengikuti shape model `rooms` & `carts` di schema.prisma
  const fakeRoom = {
    id: 'r1',
    name: 'Deluxe',
    description: 'Kamar deluxe',
    price: new Decimal(100000),
    image: 'deluxe.jpg',
    type: 'deluxe',
    stock: 5,
  };

  // time_start/time_end di DB bertipe DateTime @db.Time -> tetap object Date di JS,
  // cuma bagian jam:menit:detik yang relevan
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
    total_price: new Decimal(200000),
    created_at: new Date('2026-09-13T00:00:00.000Z'),
    rooms: fakeRoom, // hasil join, dipakai updateCart kalau room_id tidak diubah
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: CartsRepository,
          useValue: {
            getAdminCarts: jest.fn(),
            getAllCarts: jest.fn(),
            getCartById: jest.fn(),
            getRoomById: jest.fn(),
            createCart: jest.fn(),
            updateCart: jest.fn(),
            deleteCart: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    repository = module.get(CartsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllCarts', () => {
    it('mengembalikan carts dengan time_start/time_end sudah diformat jadi string HH:mm:ss', async () => {
      repository.getAllCarts.mockResolvedValue([fakeCart] as any);

      const result = await service.getAllCarts('u1');

      expect(result[0].time_start).toBe('10:00:00');
      expect(result[0].time_end).toBe('12:00:00');
    });
  });

  describe('getCartById', () => {
    it('throw NotFoundException kalau cart tidak ditemukan', async () => {
      repository.getCartById.mockResolvedValue(null);
      await expect(service.getCartById('unknown', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('mengembalikan cart yang diformat kalau ditemukan', async () => {
      repository.getCartById.mockResolvedValue(fakeCart as any);

      const result = await service.getCartById('c1', 'u1');

      expect(result.time_start).toBe('10:00:00');
    });
  });

  describe('createCart', () => {
    const dto = {
      room_id: 'r1',
      quantity: 2,
      time_start: '10:00',
      time_end: '12:00',
    };

    it('throw NotFoundException kalau room tidak ditemukan', async () => {
      repository.getRoomById.mockResolvedValue(null);

      await expect(service.createCart(dto as any, 'u1')).rejects.toThrow(NotFoundException);
    });

    it('throw NotFoundException kalau room out of stock', async () => {
      repository.getRoomById.mockResolvedValue({ ...fakeRoom, stock: 0 } as any);

      await expect(service.createCart(dto as any, 'u1')).rejects.toThrow(NotFoundException);
    });

    it('throw BadRequestException kalau time_end sebelum time_start', async () => {
      repository.getRoomById.mockResolvedValue(fakeRoom as any);

      await expect(
        service.createCart({ ...dto, time_start: '12:00', time_end: '10:00' } as any, 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('berhasil createCart dan hitung total_price dengan benar', async () => {
      repository.getRoomById.mockResolvedValue(fakeRoom as any);
      repository.createCart.mockResolvedValue(fakeCart as any);

      const result = await service.createCart(dto as any, 'u1');

      // durasi 2 jam x harga 100000 x qty 2 = 400000
      expect(repository.createCart).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'u1',
          total_price: expect.objectContaining({ d: expect.anything() }), // instance Decimal
        }),
      );
      expect(result.time_start).toBe('10:00:00'); // hasil mapCart dari fakeCart yg di-mock
    });
  });

  describe('deleteCart', () => {
    it('throw NotFoundException kalau cart tidak ditemukan', async () => {
      repository.getCartById.mockResolvedValue(null);

      await expect(service.deleteCart('unknown', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('memanggil repository.deleteCart kalau cart ditemukan', async () => {
      repository.getCartById.mockResolvedValue(fakeCart as any);
      repository.deleteCart.mockResolvedValue(fakeCart as any);

      await service.deleteCart('c1', 'u1');

      expect(repository.deleteCart).toHaveBeenCalledWith('c1', 'u1');
    });
  });
});