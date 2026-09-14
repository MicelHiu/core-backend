import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

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
          },
        },
      ],
    }).compile();

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
