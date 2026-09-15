import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID } from "class-validator";

export class CreateBookingDto {
    @ApiProperty({ example: 'b3f1c1a0-1234-4a5b-9c0d-1234567890ab' })
    @IsUUID()
    cart_id!: string;

    @ApiProperty({ example: 'Tjahjo Liniarti' })
    @IsString()
    guest_name!: string;

    @ApiProperty({ example: '081xxxxxxxx' })
    @IsString()
    guest_contact!: string;
}