
import { IsBoolean, IsDateString, IsDecimal, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Decimal } from "generated/prisma/internal/prismaNamespace";

export class UpdateDiscountDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsDecimal()
    @IsOptional()
    value?: Decimal;

    @IsDateString()
    @IsOptional()
    valid_from?: string;

    @IsDateString()
    @IsOptional()
    valid_until?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}