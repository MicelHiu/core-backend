import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, Matches, Min } from "class-validator"

export class CreateCartDto {
    @IsString()
    room_id!: string;

    @IsNumber()
    @Min(1)
    quantity!: number;

    @IsUUID()
    @IsOptional()
    discount_id?: string;

    @Type(() => Date)
    @IsDate()
    date_play!: Date;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    time_start!: string;
    
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, {
        message: 'time must be in format HH:mm or HH:mm:ss',
    })
    time_end!: string;   
}