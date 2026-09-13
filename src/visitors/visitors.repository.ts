import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { booking_status } from "generated/prisma/enums";

@Injectable()
export class VisitorsRepository {
    constructor(private readonly prisma: PrismaService) {}

    getBookingStatus(code: string) {
        return this.prisma.bookings.findUnique({
            where: { code },
            select: { code: true, status: true, user_id: true },
        });
    }

    createVisitor(dto: { booking_code: string; user_id: string; guest_name: string; checked_in: Date }) {
        return this.prisma.visitors.create({
            data: dto,
            include: {
                bookings: { select: { code: true, room_id: true, date_play: true, status: true },  },
            },
        });
    }

    findAll(from?: Date, to?: Date) {
        return this.prisma.visitors.findMany({
            where: {
                ...(from || to ? {
                    checked_in: {
                        ...(from && { gte: from }),
                        ...(to && { lte: to }),
                    },
                } : {}),
            },
            include: {
                bookings: { select: { code: true, room_id: true, date_play: true, status: true } },
            },
            orderBy: { checked_in: 'desc' },
        });
    }

    findById(id: string) {
        return this.prisma.visitors.findUnique({
            where: { id },
            include: {
                bookings: { 
                    select: { 
                        code: true, room_id: true, date_play: true, 
                        status: true 
                    } 
                },
            },
        });
    }

    // Ambil semua checked_in di rentang tahun/bulan tertentu, agregasi dilakukan di service
    findCheckedInInRange(from: Date, to: Date) {
        return this.prisma.visitors.findMany({
            where: { checked_in: { gte: from, lte: to } },
            select: { checked_in: true },
        });
    }
}