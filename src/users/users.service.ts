import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcrypt";
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository, private readonly jwt: JwtService
    ) {}

    async getUserById(id: string) {
        const user = await this.usersRepository.getUserById(id);
        if(!user) throw new NotFoundException("User Not Found");
        return user;
    }

    async resetPassword(id: string, dto: ResetPasswordDto) {
        const user = await this.usersRepository.getUserById(id);
        if (!user || user.email.toLowerCase() !== dto.email.toLowerCase()) {
            throw new NotFoundException('User not found');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        return this.usersRepository.updatePassword(id, hashedPassword);
    }
}
