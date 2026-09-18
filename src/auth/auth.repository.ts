import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) {}

    getEmail(email:string) {
        return this.prisma.users.findUnique({
            where: {email},
            select: {
                id: true,
                full_name: true,
                points: true,
                role: true,
            }
        });
    }

    async getPassword(email:string): Promise<string | null> {
        const user = await this.prisma.users.findUnique({
            where: {email},
            select: { password: true },
        });
        return user?.password || null;
    }

    createUser(dto: RegisterDto, hashedPassword: string) {
        return this.prisma.users.create({
            data: {
                full_name: dto.full_name,
                nickname: dto.nickname,
                contact: dto.contact,
                email: dto.email,
                password: hashedPassword,
                role: 'user',
                points: 0,
            },
            omit: { password: true},
        });
    }

    getUserById(id: string) {
        return this.prisma.users.findUnique({where: {id}});
    }

    // dipakai forgot/reset password: butuh hash password untuk mengikat token reset
    getUserForReset(where: { email: string } | { id: string }) {
        return this.prisma.users.findUnique({
            where,
            select: { id: true, email: true, full_name: true, password: true },
        });
    }

    updatePassword(id: string, hashedPassword: string) {
        return this.prisma.users.update({
            where: { id },
            data: { password: hashedPassword },
            select: { id: true },
        });
    }
}