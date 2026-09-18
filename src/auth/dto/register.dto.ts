import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

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

    @ApiProperty({ example: 'micel123', description: 'At least 8 characters, with at least one letter and one number' })
    @MinLength(8, { message: 'password must be at least 8 characters long' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password must contain at least one letter and one number' })
    password!: string;
}
