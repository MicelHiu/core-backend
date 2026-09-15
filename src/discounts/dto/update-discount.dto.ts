import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsDecimal, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Decimal } from "generated/prisma/internal/prismaNamespace";

export class UpdateDiscountDto {
    @ApiProperty({ example: 'Independence Day Promo', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: '10', required: false })
    @IsDecimal()
    @IsOptional()
    value?: Decimal;

    @ApiProperty({ example: '2026-08-01', required: false })
    @IsDateString()
    @IsOptional()
    valid_from?: string;

    @ApiProperty({ example: '2026-08-31', required: false })
    @IsDateString()
    @IsOptional()
    valid_until?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}