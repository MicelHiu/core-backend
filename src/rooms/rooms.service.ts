import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';

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
}
