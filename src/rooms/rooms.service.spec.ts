import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';

describe('RoomsService', () => {
  let service: RoomsService;
  let repository: jest.Mocked<RoomsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: RoomsRepository,
          useValue: {
            getAllRooms: jest.fn(),
            getRoomById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    repository = module.get(RoomsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRooms', () => {
    it('mengembalikan semua room dari repository', async () => {
      const fakeRooms = [{ id: 'r1', name: 'Deluxe' }, { id: 'r2', name: 'Suite' }];
      repository.getAllRooms.mockResolvedValue(fakeRooms as any);

      const result = await service.getAllRooms();

      expect(result).toEqual(fakeRooms);
    });
  });

  describe('getRoomById', () => {
    it('mengembalikan room kalau ditemukan', async () => {
      const fakeRoom = { id: 'r1', name: 'Deluxe' };
      repository.getRoomById.mockResolvedValue(fakeRoom as any);

      const result = await service.getRoomById('r1');

      expect(result).toEqual(fakeRoom);
      expect(repository.getRoomById).toHaveBeenCalledWith('r1');
    });

    it('throw NotFoundException kalau room tidak ditemukan', async () => {
      repository.getRoomById.mockResolvedValue(null);

      await expect(service.getRoomById('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });
});