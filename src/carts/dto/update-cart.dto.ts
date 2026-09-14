import { IsDate, IsDecimal, IsNumber, IsOptional, IsString, IsUUID, Matches, Min } from "class-validator"
import { Decimal } from "generated/prisma/internal/prismaNamespace";

export class UpdateCartDto {
    @IsString()
    @IsOptional()
    room_id?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    quantity?: number;

    @IsUUID()
    @IsOptional()
    discount_id?: string;      
    
    @IsDate()
    @IsOptional()
    date_play?: Date;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    @IsOptional()
    time_start?: string;
    
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    @IsOptional()
    time_end?: string;  
}