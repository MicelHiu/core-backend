import { Injectable } from "@nestjs/common";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RoomsRepository {
    constructor(private readonly prisma: PrismaService) {}

    getAllRooms() {
        return this.prisma.rooms.findMany();
    }

    getRoomById(id: string) {
        return this.prisma.rooms.findUnique({where: {id}});
    }

    private toTimeDate(time: string): Date {
        return new Date(`1970-01-01T${time}:00.000Z`);
    }

    async getBookedQuantity(roomId: string, date: Date, rangeStart: string, rangeEnd: string): Promise<number> {
        const start = this.toTimeDate(rangeStart);
        const end = this.toTimeDate(rangeEnd);
        const result = await this.prisma.bookings.aggregate({
            _sum: { quantity: true },
            where: {
                room_id: roomId,
                date_play: date,
                status: { in: ['confirmed', 'ongoing', 'completed'] },
                time_start: { lt: end },
                time_end: { gt: start },
            },
        });
        return result._sum.quantity ?? 0;
    }

    async patchRoom(id: string, dto: UpdateRoomDto) {
        const currentData = await this.getRoomById(id);
        if(!currentData) return undefined;
        return this.prisma.rooms.update({
            data: dto,
            where: {id},
        });
    }
}