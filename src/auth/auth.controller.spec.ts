import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register memanggil service.register dengan dto', async () => {
    const dto = {
      email: 'budi@example.com',
      password: 'plainpassword',
      full_name: 'Budi',
      nickname: 'budi',
      contact: '081234567890',
    };
    service.register.mockResolvedValue({ id: 'u1' } as any);

    const result = await controller.register(dto as any);

    expect(service.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'u1' });
  });

  it('login memanggil service.login dengan credentials', async () => {
    const credentials = { email: 'budi@example.com', password: 'plainpassword' };
    service.login.mockResolvedValue({ access_token: 'fake.jwt.token' } as any);

    const result = await controller.login(credentials as any);

    expect(service.login).toHaveBeenCalledWith(credentials);
    expect(result).toEqual({ access_token: 'fake.jwt.token' });
  });
});