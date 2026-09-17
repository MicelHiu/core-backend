import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { booking_status } from 'generated/prisma/enums';

@Injectable()
export class ActivityLogsRepository {
    constructor(private readonly prisma: PrismaService) {}

    create(data: { booking_code: string; admin_id: string; status: booking_status; note?: string }) {
        return this.prisma.activity_logs.create({
            data,
            include: {
                users: { select: { full_name: true, nickname: true } },
            },
        });
    }

    findByBookingCode(bookingCode: string) {
        return this.prisma.activity_logs.findMany({
            where: { booking_code: bookingCode },
            include: {
                users: { select: { full_name: true, nickname: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
}
