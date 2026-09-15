import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateVisitorDto {
    @ApiProperty({ example: 'BKG-2026-0001' })
    @IsString()
    booking_code!: string;

    @ApiProperty({ example: 'Tjahjo Liniarti' })
    @IsString()
    guest_name!: string;

    @ApiProperty({ example: '2026-09-15T09:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    checked_in?: string;
}