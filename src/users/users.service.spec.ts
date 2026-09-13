import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  // fake data mengikuti shape model `users` di schema.prisma, tanpa `password`
  // karena repository query-nya pakai `omit: { password: true }`
  const fakeUser = {
    id: '18313565-98c7-44db-93f2-4073449136ee',
    full_name: 'Budi Santoso',
    nickname: 'Budi',
    email: 'budi@example.com',
    contact: '081234567890',
    role: 'admin',
    points: 100,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        {
          // JwtService di-inject di constructor UsersService tapi belum dipakai
          // method manapun saat ini — tetap wajib di-mock supaya module bisa compile
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserById', () => {
    it('mengembalikan user kalau ditemukan', async () => {
      repository.getUserById.mockResolvedValue(fakeUser as any);

      const result = await service.getUserById(fakeUser.id);

      expect(result).toEqual(fakeUser);
      expect(repository.getUserById).toHaveBeenCalledWith(fakeUser.id);
    });

    it('throw NotFoundException kalau user tidak ditemukan', async () => {
      repository.getUserById.mockResolvedValue(null);

      await expect(service.getUserById('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });
});