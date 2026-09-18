import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { MailService } from 'src/mail/mail.service';
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
  let mail: jest.Mocked<MailService>;

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
            getUserForReset: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordReset: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get(AuthRepository);
    jwt = module.get(JwtService);
    mail = module.get(MailService);
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

  describe('forgotPassword', () => {
    const genericMessage = { message: 'If the email is registered, a reset link has been sent.' };

    it('email tidak terdaftar: pesan sama & tidak kirim email', async () => {
      (repository as any).getUserForReset.mockResolvedValue(null);

      const result = await service.forgotPassword('ghost@example.com');

      expect(result).toEqual(genericMessage);
      expect(mail.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('email terdaftar: kirim link berisi token reset 15 menit', async () => {
      (repository as any).getUserForReset.mockResolvedValue({
        id: 'u1', email: 'budi@example.com', full_name: 'Budi', password: 'hash-lama',
      });
      jwt.signAsync.mockResolvedValue('reset.token' as never);

      const result = await service.forgotPassword('budi@example.com');

      expect(result).toEqual(genericMessage);
      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'u1', purpose: 'password-reset' }),
        { expiresIn: '15m' },
      );
      expect(mail.sendPasswordReset).toHaveBeenCalledWith(
        'budi@example.com', 'Budi', expect.stringContaining('/reset-password?token=reset.token'),
      );
    });
  });

  describe('resetPassword', () => {
    it('token tidak valid / expired: BadRequestException', async () => {
      jwt.verifyAsync.mockRejectedValue(new Error('jwt expired') as never);

      await expect(service.resetPassword('bad', 'newpass123')).rejects.toThrow(BadRequestException);
    });

    it('token bukan untuk reset (mis. access token): BadRequestException', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1', role: 'user' } as never);

      await expect(service.resetPassword('access.token', 'newpass123')).rejects.toThrow(BadRequestException);
    });

    it('link sudah dipakai (password sudah berubah): BadRequestException', async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: 'u1', purpose: 'password-reset', fp: 'fingerprint-lama' } as never);
      (repository as any).getUserForReset.mockResolvedValue({
        id: 'u1', email: 'budi@example.com', full_name: 'Budi', password: 'hash-baru',
      });

      await expect(service.resetPassword('used.token', 'newpass123')).rejects.toThrow(BadRequestException);
      expect((repository as any).updatePassword).not.toHaveBeenCalled();
    });

    it('token valid: hash password baru lalu simpan', async () => {
      // token dibuat dari hash password saat ini -> fingerprint cocok
      const user = { id: 'u1', email: 'budi@example.com', full_name: 'Budi', password: 'hash-lama' };
      (repository as any).getUserForReset.mockResolvedValue(user);
      jwt.signAsync.mockResolvedValue('reset.token' as never);
      await service.forgotPassword(user.email);
      const payload = jwt.signAsync.mock.calls[0][0];

      jwt.verifyAsync.mockResolvedValue(payload as never);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash-baru' as never);

      await service.resetPassword('reset.token', 'newpass123');

      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
      expect((repository as any).updatePassword).toHaveBeenCalledWith('u1', 'hash-baru');
    });
  });
});