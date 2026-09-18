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
}