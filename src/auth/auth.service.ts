import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from "bcrypt";
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwt: JwtService,
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

    async lookupEmail(email: string) {
        return this.authRepository.getEmail(email);
    }
}
