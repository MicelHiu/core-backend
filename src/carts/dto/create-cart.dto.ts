import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, Matches, Min } from "class-validator"

export class CreateCartDto {
    @ApiProperty({ example: 'room-001' })
    @IsString()
    room_id!: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    @Min(1)
    quantity!: number;

    @ApiProperty({ example: 'b3f1c1a0-1234-4a5b-9c0d-1234567890ab', required: false })
    @IsUUID()
    @IsOptional()
    discount_id?: string;

    @ApiProperty({ example: '2026-09-20' })
    @Type(() => Date)
    @IsDate()
    date_play!: Date;

    @ApiProperty({ example: '10:00' })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    time_start!: string;

    @ApiProperty({ example: '12:00' })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    time_end!: string;
}