
import { IsBoolean, IsDateString, IsDecimal, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Decimal } from "generated/prisma/internal/prismaNamespace";

export class CreateDiscountDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsDecimal()
    @IsNotEmpty()
    value!: Decimal;

    @IsDateString()
    @IsNotEmpty()
    valid_from!: string;

    @IsDateString()
    @IsNotEmpty()
    valid_until!: string;

    @IsNotEmpty()
    @IsBoolean()
    is_active!: boolean;
}