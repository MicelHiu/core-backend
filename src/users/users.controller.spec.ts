import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentUser', () => {
    it('memanggil service.getUserById dengan id dari user yang login (req.user)', async () => {
      service.getUserById.mockResolvedValue(fakeUser as any);

      // simulasi @CurrentUser() decorator — di real request ini diisi JwtAuthGuard
      // dari payload token, di test kita simulasikan langsung objectnya
      const result = await controller.getCurrentUser({ id: fakeUser.id, role: fakeUser.role });

      expect(result).toEqual(fakeUser);
      expect(service.getUserById).toHaveBeenCalledWith(fakeUser.id);
    });
  });
});