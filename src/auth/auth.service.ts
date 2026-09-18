import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from "bcrypt";
import { createHash } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.authRepository.getEmail(dto.email);
    if(existingEmail !== null) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.authRepository.createUser(dto, hashedPassword);
  }

  async login(credentials: LoginDto) {
        // check if email exists
        // same message for every failure, so the response can't be used to probe which emails are registered
        const user = await this.authRepository.getEmail(credentials.email);
        if(!user) throw new UnauthorizedException('Invalid Credentials');

        //if email exists, get password from base
        const hashedPassword = await this.authRepository.getPassword(credentials.email);
        if(!hashedPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        //compare password with hashed password
        const isMatch = await bcrypt.compare(credentials.password, hashedPassword);
        if(!isMatch) throw new UnauthorizedException('Invalid credentials');

        const payload = { sub: user.id, role: user.role };
        return { access_token: await this.jwt.signAsync(payload)}
    }

    // Selalu balas pesan yang sama, supaya endpoint ini tidak bisa dipakai untuk cek email terdaftar
    async forgotPassword(email: string) {
        const user = await this.authRepository.getUserForReset({ email });
        if (user) {
            const token = await this.jwt.signAsync(
                { sub: user.id, purpose: 'password-reset', fp: this.passwordFingerprint(user.password) },
                { expiresIn: '15m' },
            );
            const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
            const link = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
            await this.mail.sendPasswordReset(user.email, user.full_name, link);
        }
        return { message: 'If the email is registered, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        let payload: { sub: string; purpose: string; fp: string };
        try {
            payload = await this.jwt.verifyAsync(token);
        } catch {
            throw new BadRequestException('Reset link is invalid or has expired');
        }
        if (payload.purpose !== 'password-reset') {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        // fingerprint berubah setelah password diganti -> link otomatis sekali pakai
        const user = await this.authRepository.getUserForReset({ id: payload.sub });
        if (!user || this.passwordFingerprint(user.password) !== payload.fp) {
            throw new BadRequestException('Reset link is invalid or has expired');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.authRepository.updatePassword(user.id, hashedPassword);
        return { message: 'Password has been reset. Please log in with your new password.' };
    }

    private passwordFingerprint(hashedPassword: string) {
        return createHash('sha256').update(hashedPassword).digest('hex').slice(0, 16);
    }
}
