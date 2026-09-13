import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

// mock seluruh modul bcrypt — kita kontrol sendiri hasil hash/compare-nya
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<AuthRepository>;
  let jwt: jest.Mocked<JwtService>;

  const fakeUser = {
    id: 'u1',
    email: 'budi@example.com',
    role: 'user',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            getEmail: jest.fn(),
            getPassword: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get(AuthRepository);
    jwt = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    return undefined;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = { email: 'budi@example.com', password: 'plainpassword', full_name: 'Budi' };

    it('throw ConflictException kalau email sudah terdaftar', async () => {
      repository.getEmail.mockResolvedValue(fakeUser as any);

      await expect(service.register(dto as any)).rejects.toThrow(ConflictException);
      // pastikan tidak lanjut hash password kalau email sudah ada
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('berhasil register: hash password lalu simpan user', async () => {
      repository.getEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password-123' as never);
      repository.createUser.mockResolvedValue({ id: 'u1', ...dto } as any);

      const result = await service.register(dto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(repository.createUser).toHaveBeenCalledWith(dto as any, 'hashed-password-123');
      expect(result).toEqual({ id: 'u1', ...dto });
    });
  });

  describe('login', () => {
    const credentials = { email: 'budi@example.com', password: 'plainpassword' };

    it('throw UnauthorizedException kalau email tidak ditemukan', async () => {
      repository.getEmail.mockResolvedValue(null);

      await expect(service.login(credentials as any)).rejects.toThrow(UnauthorizedException);
    });

    it('throw UnauthorizedException kalau password di DB tidak ada', async () => {
      repository.getEmail.mockResolvedValue(fakeUser as any);
      repository.getPassword.mockResolvedValue(null);

      await expect(service.login(credentials as any)).rejects.toThrow(UnauthorizedException);
    });

    it('throw UnauthorizedException kalau password salah', async () => {
      repository.getEmail.mockResolvedValue(fakeUser as any);
      repository.getPassword.mockResolvedValue('hashed-password-123');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(service.login(credentials as any)).rejects.toThrow(UnauthorizedException);
    });

    it('berhasil login: return access_token dari jwt.signAsync', async () => {
      repository.getEmail.mockResolvedValue(fakeUser as any);
      repository.getPassword.mockResolvedValue('hashed-password-123');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jwt.signAsync.mockResolvedValue('fake.jwt.token');

      const result = await service.login(credentials as any);

      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: fakeUser.id, role: fakeUser.role });
      expect(result).toEqual({ access_token: 'fake.jwt.token' });
    });
  });
});