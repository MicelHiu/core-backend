import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { booking_status } from "generated/prisma/enums";

export class UpdateBookingDto {
    @ApiProperty({ example: 'Tjahjo Liniarti', required: false })
    @IsString()
    @IsOptional()
    guest_name?: string;

    @ApiProperty({ example: '081xxxxxxxx', required: false })
    @IsString()
    @IsOptional()
    guest_contact?: string;

    @ApiProperty({ enum: booking_status, required: false })
    @IsOptional()
    @IsEnum(booking_status)
    status?: booking_status;

    @ApiProperty({ example: 'Sudah dikonfirmasi lewat telepon', required: false })
    @IsString()
    @IsOptional()
    note?: string;
}