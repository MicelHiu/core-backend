import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { Reflector } from '@nestjs/core';

describe('RoomsController', () => {
  let controller: RoomsController;
  let service: jest.Mocked<RoomsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: {
            getAllRooms: jest.fn(),
            getRoomById: jest.fn(),
            createRoom: jest.fn(),
            updateRoom: jest.fn(),
            deleteRoom: jest.fn(),
          },
        },
      ],
    })
      // guard diuji terpisah; di sini cukup cek controller meneruskan ke service
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get(RoomsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllRooms', () => {
    it('memanggil service.getAllRooms dan meneruskan hasilnya', async () => {
      const fakeRooms = [{ id: 'r1' }];
      service.getAllRooms.mockResolvedValue(fakeRooms as any);

      const result = await controller.getAllRooms();

      expect(result).toEqual(fakeRooms);
      expect(service.getAllRooms).toHaveBeenCalled();
    });
  });

  describe('getRoomById', () => {
    it('memanggil service.getRoomById dengan id dari param', async () => {
      const fakeRoom = { id: 'r1' };
      service.getRoomById.mockResolvedValue(fakeRoom as any);

      const result = await controller.getRoomById('r1');

      expect(result).toEqual(fakeRoom);
      expect(service.getRoomById).toHaveBeenCalledWith('r1');
    });
  });
});

describe('RoomsController admin guards', () => {
  const reflector = new Reflector();
  const writeHandlers = ['createRoom', 'updateRoom', 'deleteRoom'] as const;

  it.each(writeHandlers)('%s dilindungi JwtAuthGuard + RolesGuard dengan role admin', (handler) => {
    const method = RoomsController.prototype[handler];
    const guards = Reflect.getMetadata('__guards__', method);
    const roles = reflector.get<string[]>('roles', method);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual(['admin']);
  });

  it.each(['getAllRooms', 'getRoomById'] as const)('%s tetap publik', (handler) => {
    expect(Reflect.getMetadata('__guards__', RoomsController.prototype[handler])).toBeUndefined();
  });
});
