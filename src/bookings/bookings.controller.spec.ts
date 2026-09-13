import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles-guard';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: jest.Mocked<BookingsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: {
            getCustomerBookings: jest.fn(),
            getAllBookingDetails: jest.fn(),
            getAllBookings: jest.fn(),
            getBookingDetail: jest.fn(),
            createBooking: jest.fn(),
            updateBooking: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get(BookingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getCustomerBookings memanggil service tanpa argumen', () => {
    controller.getCustomerBookings();
    expect(service.getCustomerBookings).toHaveBeenCalled();
  });

  it('getAllBookingDetails (admin) memanggil service dengan code dari param', () => {
    controller.getAllBookingDetails('BK-20260913-ABCDEF');
    expect(service.getAllBookingDetails).toHaveBeenCalledWith('BK-20260913-ABCDEF');
  });

  it('getAllBookings memanggil service dengan userId dari CurrentUser', () => {
    controller.getAllBookings({ id: 'u1' });
    expect(service.getAllBookings).toHaveBeenCalledWith('u1');
    controller.getBookingDetail({ id: 'u1' }, 'BK-20260913-ABCDEF');
    expect(service.getBookingDetail).toHaveBeenCalledWith('u1', 'BK-20260913-ABCDEF');
  });

  it('createBooking memanggil service dengan userId dan dto', () => {
    const dto = { cart_id: 'c1', guest_name: 'Budi', guest_contact: '0812345678' };
    controller.createBooking({ id: 'u1' }, dto as any);
    expect(service.createBooking).toHaveBeenCalledWith('u1', dto);
  });

  it('updateBooking memanggil service dengan userId, code, dan dto', () => {
    const dto = { status: 'ongoing' } as const;
    controller.updateBooking({ id: 'u1' }, dto as any, 'BK-20260913-ABCDEF');
    expect(service.updateBooking).toHaveBeenCalledWith('u1', 'BK-20260913-ABCDEF', dto);
  });
});