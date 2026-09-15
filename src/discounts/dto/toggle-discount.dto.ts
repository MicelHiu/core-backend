import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class ToggleDiscountDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    @IsNotEmpty()
    is_active!: boolean;
}