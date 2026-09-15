import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsDecimal, IsNotEmpty, IsString } from "class-validator";
import { Decimal } from "generated/prisma/internal/prismaNamespace";

export class CreateDiscountDto {
    @ApiProperty({ example: 'Independence Day Promo' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: '10' })
    @IsDecimal()
    @IsNotEmpty()
    value!: Decimal;

    @ApiProperty({ example: '2026-08-01' })
    @IsDateString()
    @IsNotEmpty()
    valid_from!: string;

    @ApiProperty({ example: '2026-08-31' })
    @IsDateString()
    @IsNotEmpty()
    valid_until!: string;
}