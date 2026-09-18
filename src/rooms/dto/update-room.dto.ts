import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';

// id tidak bisa diubah (dipakai sebagai foreign key di carts & bookings)
export class UpdateRoomDto extends PartialType(OmitType(CreateRoomDto, ['id'] as const)) {}
