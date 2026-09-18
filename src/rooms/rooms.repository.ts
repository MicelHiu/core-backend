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

    createRoom(dto: CreateRoomDto) {
        return this.prisma.rooms.create({ data: dto });
    }

    updateRoom(id: string, dto: UpdateRoomDto) {
        return this.prisma.rooms.update({
            data: dto,
            where: {id},
        });
    }

    countBookings(roomId: string) {
        return this.prisma.bookings.count({ where: { room_id: roomId } });
    }

    // cart yang masih nyangkut ke room ini ikut dihapus (FK carts -> rooms = Restrict)
    deleteRoom(id: string) {
        return this.prisma.$transaction([
            this.prisma.carts.deleteMany({ where: { room_id: id } }),
            this.prisma.rooms.delete({ where: { id } }),
        ]);
    }
}