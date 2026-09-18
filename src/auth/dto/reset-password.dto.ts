import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({ description: 'Token from the reset link sent by email' })
    @IsString()
    token: string;

    @ApiProperty({ example: 'newpassword123' })
    @IsString()
    @MinLength(6)
    password: string;
}
