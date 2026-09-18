import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsDecimal, IsNumber, IsOptional, IsString, IsUUID, Matches, Min } from "class-validator"
import { Decimal } from "generated/prisma/internal/prismaNamespace";

export class UpdateCartDto {
    @ApiProperty({ example: 'room-001', required: false })
    @IsString()
    @IsOptional()
    room_id?: string;

    @ApiProperty({ example: 2, required: false })
    @IsNumber()
    @Min(1)
    @IsOptional()
    quantity?: number;

    @ApiProperty({ example: 'b3f1c1a0-1234-4a5b-9c0d-1234567890ab', required: false, nullable: true })
    @IsUUID()
    @IsOptional()
    discount_id?: string | null;

    @ApiProperty({ example: '2026-09-20', required: false })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    date_play?: Date;

    @ApiProperty({ example: '10:00', required: false })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    @IsOptional()
    time_start?: string;

    @ApiProperty({ example: '12:00', required: false })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    @IsOptional()
    time_end?: string;
}