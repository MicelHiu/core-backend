import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    getUserById(id: string) {
        return this.prisma.users.findUnique({
            where: {id},
            omit: {password: true},
        });
    }

    incrementPoints(userId: string, delta: number) {
        return this.prisma.users.update({
            where: { id: userId },
            data: { points: { increment: delta } },
        });
    }
}