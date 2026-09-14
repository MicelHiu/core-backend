import { Test, TestingModule } from '@nestjs/testing';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('CartsController', () => {
  let controller: CartsController;
  let service: jest.Mocked<CartsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartsController],
      providers: [
        {
          provide: CartsService,
          useValue: {
            getAdminCarts: jest.fn(),
            getAllCarts: jest.fn(),
            getCartById: jest.fn(),
            createCart: jest.fn(),
            updateCart: jest.fn(),
            deleteCart: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CartsController>(CartsController);
    service = module.get(CartsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllCarts memanggil service dengan userId dari CurrentUser', () => {
    controller.getAllCarts({ id: 'u1' });
    expect(service.getAllCarts).toHaveBeenCalledWith('u1');
  });

  it('getCartById memanggil service dengan id param dan userId', () => {
    controller.getCartById({ id: 'u1' }, 'c1');
    expect(service.getCartById).toHaveBeenCalledWith('c1', 'u1');
  });

  it('createCart memanggil service dengan dto dan userId', () => {
    const dto = {
      room_id: 'r1',
      quantity: 1,
      date_play: new Date('2024-01-01'),
      time_start: '10:00',
      time_end: '12:00',
    };
    controller.createCart({ id: 'u1' }, dto as any);
    expect(service.createCart).toHaveBeenCalledWith(dto, 'u1');
  });

  it('updateCarts memanggil service dengan dto, id, dan userId', () => {
    const dto = { quantity: 3 };
    controller.updateCarts('c1', { id: 'u1' }, dto as any);
    expect(service.updateCart).toHaveBeenCalledWith(dto, 'c1', 'u1');
  });

  it('deleteCart memanggil service dengan id dan userId', () => {
    controller.deleteCart('c1', { id: 'u1' });
    expect(service.deleteCart).toHaveBeenCalledWith('c1', 'u1');
  });
});