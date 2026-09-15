import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({ example: 'Tjahjo Liniarti'})
    @IsString()
    @MaxLength(255)
    full_name!: string;

    @ApiProperty({ example: 'Nini'})
    @IsString()
    @MaxLength(10)
    nickname!: string;

    @ApiProperty({example: 'nini@gmail.com'})
    @IsEmail()
    email!: string;

    @ApiProperty({example: '081xxxxxxxx'})
    @IsString()
    contact!: string;

    @ApiProperty({example: 'micel123'})
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8}$/)
    password!: string;
}
