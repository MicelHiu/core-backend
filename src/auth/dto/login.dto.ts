import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'user@gmail.com'})
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'pass123' })
    @IsString()
    password!: string;
}
