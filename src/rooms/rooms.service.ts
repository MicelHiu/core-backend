import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  private async withStockToday<T extends { id: string; stock: number }>(room: T) {
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const booked = await this.roomsRepository.getBookedQuantity(room.id, startOfToday(), nowTime, nowTime);
    return { ...room, stock_today: Math.max(room.stock - booked, 0) };
  }

  async getAllRooms() {
    const rooms = await this.roomsRepository.getAllRooms();
    return Promise.all(rooms.map((room) => this.withStockToday(room)));
  }

  async getRoomById(id: string) {
    const room = await this.roomsRepository.getRoomById(id);
    if(!room) throw new NotFoundException("Room Not Found");
    return this.withStockToday(room);
  }

  // duplikat id ditangani PrismaExceptionFilter (P2002 -> 409)
  createRoom(dto: CreateRoomDto) {
    return this.roomsRepository.createRoom(dto);
  }

  async updateRoom(id: string, dto: UpdateRoomDto) {
    const room = await this.roomsRepository.getRoomById(id);
    if(!room) throw new NotFoundException("Room Not Found");
    return this.roomsRepository.updateRoom(id, dto);
  }

  async deleteRoom(id: string) {
    const room = await this.roomsRepository.getRoomById(id);
    if(!room) throw new NotFoundException("Room Not Found");

    // booking = riwayat transaksi, tidak boleh ikut hilang
    const bookings = await this.roomsRepository.countBookings(id);
    if (bookings > 0) {
      throw new ConflictException(`Room has ${bookings} booking(s) and can't be deleted. Set its stock to 0 instead.`);
    }

    await this.roomsRepository.deleteRoom(id);
    return { message: 'Room deleted' };
  }
}
