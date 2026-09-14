import { IsBoolean, IsNotEmpty } from "class-validator";

export class ToggleDiscountDto {
    @IsBoolean()
    @IsNotEmpty()
    is_active!: boolean;
}