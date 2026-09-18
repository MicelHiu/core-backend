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

    async getBookedQuantity(roomId: string, date: Date): Promise<number> {
        const result = await this.prisma.bookings.aggregate({
            _sum: { quantity: true },
            where: {
                room_id: roomId,
                date_play: date,
                status: { in: ['confirmed', 'ongoing', 'completed'] },
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