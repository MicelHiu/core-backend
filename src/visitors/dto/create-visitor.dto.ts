import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateVisitorDto {
    @IsString()
    booking_code!: string;

    @IsString()
    guest_name!: string;

    @IsDateString()
    @IsOptional()
    checked_in?: string;
}